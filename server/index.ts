import * as express from 'express';
import * as body_parser from 'body-parser';
import * as cookie_parser from 'cookie-parser';
import * as passport from 'passport';
import * as session from 'express-session';
import * as connect_sqlite3 from 'connect-sqlite3';


import {Strategy} from 'passport-discord';
import {DatabaseHelper} from '../database-helper';
export class ServerHandler {
    constructor(dbh: DatabaseHelper, g:any) {
        const db = dbh.get_db();
        const app = express();
        const SQLite3Store = connect_sqlite3(session);
        app.use(cookie_parser());
        app.use(body_parser.json());
        app.use(body_parser.urlencoded({extended:false}));
        app.use(session({secret:process.env.EXPRESS_SECRET,resave:true,saveUninitialized:true,store: new SQLite3Store({db:'sessions.db'})}));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use('/assets',express.static('./assets'));
        app.set('view engine', 'ejs');

        // const active_sessions = {};

        const auth_strategy = new Strategy ({
                clientID:process.env.CLIENT_ID,
                clientSecret:process.env.SECRET_ID,
                callbackURL:process.env.CALLBACK_URL
            },
            (access_token,refresh_token,profile,cb)=>{
                //@ts-ignore
                profile.refresh_token = refresh_token; 
                //@ts-ignore
                profile.access_token = access_token;
                const avatar_base = 'https://cdn.discordapp.com';
                let avatar_url = `${avatar_base}`;
                if (profile.avatar) {
                    avatar_url += `/avatars/${profile.id}/${profile.avatar}.${(profile.avatar.includes('a_')?'gif':'png')}`
                } else {
                    avatar_url += `/embed/avatars/${parseInt(profile.discriminator) % 5}.png`;
                }
                //@ts-ignore
                profile.avatar_url = avatar_url;
                cb(null,profile);
            }
        );

        passport.use(auth_strategy);
        passport.serializeUser(async (user:any,done)=>{
            //active_sessions[user.id] = user;
            const stmt_exist = db.prepare(`SELECT * FROM Sessions WHERE UserID=(?)`);
            const results = await dbh.stmt_all(stmt_exist,user.id);
            if (results.length > 0) {
                const stmt_update = db.prepare(`UPDATE Sessions SET SessionData=(?) WHERE UserID=(?)`);
                await dbh.stmt_run(stmt_update,JSON.stringify(user),user.id);
                stmt_update.finalize();
            } else {
                const stmt_insert = db.prepare(`INSERT INTO Sessions (UserID, SessionData) VALUES (?,?)`);
                await dbh.stmt_run(stmt_insert,user.id,JSON.stringify(user));
                stmt_insert.finalize();
            }
            done(null,user);
        });
        passport.deserializeUser(async (user:any,done)=>{
            //done(null,active_sessions[user.id]);
            try {
                const get_user = db.prepare(`SELECT * FROM Sessions WHERE UserID=(?)`);
                done(null,JSON.parse( (await dbh.stmt_get(get_user,user.id)).SessionData));
            } catch(e) {
                done(e,false);
            }
        });
        app.use('*',async (req,res,next)=>{
            if (req.user) {
                //@ts-ignore
                req.user.mod = await g.is_mod(req.user.id);
            }
            next();
        });
        const mod_check = (req,res,next) => {
            if (req.user) {
                //@ts-ignore
                if (req.user.mod === true) {
                    return next();
                }
            }
            res.redirect('/');
        }

        // passport/login
        app.get('/login',(req,res)=>{
            res.redirect(process.env.AUTH_URL);
        });
        app.get('/logout',(req,res)=>{
            if (req.user == undefined) {
                res.redirect('/login');
            } else {
                req.logout();
                res.redirect('/');
            }
        });
        app.get('/callback', passport.authenticate('discord',{ failureRedirect: '/'}),(req,res)=>{
            res.redirect('/');
        });

        app.get('/',(req,res)=>{
            res.render('page',{page:'index',user:req.user});
        });

        app.get('/roles',mod_check,async (req,res)=>{
            const available_roles = [];
            const result = await dbh.all(`SELECT * FROM AvailableRoles`);
            for (let i=0;i<result.length;i++) {
                const role = g.get_role(result[i].RoleID);
                available_roles.push(role);
            }
            res.render('page',{page:'roles',role_list:g.get_roles(),available_roles:available_roles,query:req.query,user:req.user});
        });
        app.post('/role/add',mod_check,async (req,res)=>{
            const role_id = req.body.role_id;
            const stmt_check = db.prepare(`SELECT * FROM AvailableRoles WHERE RoleID=(?)`);
            if ((await dbh.stmt_all(stmt_check,role_id)).length > 0) {
                stmt_check.finalize();
                return res.redirect('/roles?error=1')   // role already available
            } else {
                stmt_check.finalize();
            }
            const role = g.get_role(role_id);
            if (role == null) {
                return res.redirect('/roles?error=2');  // role doesn't exist
            }
            const stmt = db.prepare(`INSERT INTO AvailableRoles (RoleID) VALUES (?)`);
            await dbh.stmt_run(stmt,role_id);
            stmt.finalize();
            res.redirect('/roles?success=1');
        });
        app.post('/role/delete',mod_check,async (req,res)=>{
            const role_id = req.body.role_id;
            const stmt_check = db.prepare(`SELECT * FROM AvailableRoles WHERE RoleID=(?)`);
            if ((await dbh.stmt_all(stmt_check,role_id)).length == 0) {
                stmt_check.finalize();
                return res.redirect('/roles?error=3')   // role not available
            } else {
                stmt_check.finalize();
            }
            const role = g.get_role(role_id);
            if (role == null) {
                return res.redirect('/roles?error=2');  // role doesn't exist
            }
            const stmt = db.prepare(`DELETE FROM AvailableRoles WHERE RoleID = (?)`);
            await dbh.stmt_run(stmt,role_id);
            stmt.finalize();
            res.redirect('/roles?success=2');
        });
        app.get('/bio',async (req,res)=>{
            const bio_list = await dbh.all(`SELECT * FROM Bio`);
            const stmt_my_bio = db.prepare(`SELECT * FROM Bio WHERE DiscordID=(?)`);
            //@ts-ignore
            const my_bio = await dbh.stmt_get(stmt_my_bio,req.user.id);
            for (const bio of bio_list) {
                const user_id = bio.DiscordID;
                bio.user = await g.get_user(user_id);
            }
            res.render('page',{page:'bio', bio_list:bio_list, my_bio:(my_bio != undefined ? my_bio : {}), user:req.user, query:req.query});
        });
        
        app.post('/bio/update',async(req,res)=>{
            //@ts-ignore
            const user_id = req.user.id;
            const stmt_check = db.prepare(`SELECT * FROM Bio WHERE DiscordID=(?)`);
            const result = await dbh.stmt_all(stmt_check,user_id);
            console.log(req.body);
            try {
                if (result.length > 0) {
                    const stmt_update = db.prepare(`UPDATE Bio SET Description=(?), Quote=(?), Job=(?) WHERE DiscordID=(?)`);
                    await dbh.stmt_run(stmt_update,req.body.description, req.body.quote, req.body.job_title, user_id);
                    stmt_update.finalize();
                } else {
                    const stmt_insert = db.prepare(`INSERT INTO Bio (DiscordID, Description, Quote, Job) VALUES (?,?,?,?)`);
                    await dbh.stmt_run(stmt_insert,user_id,req.body.description,req.body.quote,req.body.job_title)
                    stmt_insert.finalize();
                }
                res.redirect('/bio?success=1');
            } catch(e) {
                res.redirect('/bio?error=1');
            }
        })

        app.listen(process.env.PORT);
    }
}