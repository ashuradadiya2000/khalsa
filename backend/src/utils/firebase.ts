import admin from 'firebase-admin';
import serviceAccount from './khalasa-phulwari-firebase-adminsdk-fbsvc-a9437bf346.json';


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

export default admin;