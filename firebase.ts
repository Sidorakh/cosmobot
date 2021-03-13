import * as admin from 'firebase-admin';
admin.initializeApp({
    credential: admin.credential.cert(require('./admin.json')),
});

const firestore = admin.firestore();

export {
    firestore
}