import admin from "firebase-admin";
let app;
if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "devcamp-web-app",
      clientEmail: "firebase-adminsdk-fbsvc@devcamp-web-app.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCs5MhNNbAcdnNU\ntwSe5QueLdYSkhytKjedBnEq5aaDcpwpsClhCgHxdytfuhpX36wUP8571c2zGQcs\norl+p+u+gxARsEHj+6QEsodya56AIek97TFBcSwXFEomX0RwA7zC+6EogvQxJt+k\nVjiCcHaYMl0VljFpgJk4qLLtsHRnaZlZvFfsaDCj/FIzi7rx8Dhj/YmrmMk7rhkx\nyaQdqtPdOrQxv7xd8hE2DyQD7y0etIJlrKjh4xO57xeCKX/mat3bIzlaHfbEFEUD\n/GlOlTsEwwDqHR5g1qoZx85lMOhLSKV8rlWVOAPxXt/PRdpnuxjKiIc7pNSEYc3c\nEiLQivg3AgMBAAECggEAEd6iS/Ck9Nwn9sqPzLMpweiaPAMkDvXSbQVnGaLw1JyP\nmB4gDhU7DC+1U53oQ8rXffmg/YWkpBfjI5w8sI2UknVOFOCd1CgvKgPLIhVjes+G\ndvhsDd0vocG0GZvhIUlm737oh50Otix+vafiYVZUZk4A9vk2FDckHwoOAakqRCx8\nvaByXLZxqKD0ZNgfOb7kpWvR0ZQF5ZOD1fKE29rJhXlpqIMpOCHwGGGzEKPGGWP/\nFz+tTD4Svv0fGvZCjrvS7QJj0FXX9iJpNzP4ZcaEpZUoP+SaHIxdfnbLkAcvXXIk\nvNBMr4ZUoKO0Q/ypu6fNHbNM1cgDZfJypKZQRmNimQKBgQDbvAhp2wA/sE7DdANs\nw17OUxjqYnkT0qFycPXc90tAM9JHafc3tSxjEYu7dZOMYoxzNGqRn+Moe1kko7Ya\nK+peZhnwj2G6qD5CoXO2AEbE1QuuOSpCCSSgbvr/8586FbqI+ZSOrvyaf02eBOKR\nVHy81SNclmZkImvln/AkO32/tQKBgQDJba9+9kCidvylUYWBjFQ5fVR4FC5nqMQi\nrEeIrQT7/95/x92d+EImilYnH3PzlaQxSRBvUcvAePtIKmBkkdwPGojH45QZfaTT\nrJogLFIfz+Eg/bABBY1m2NWF6YJ8PCzJUVz3pZrPL8PlwAXFGeM8PliPps/PlfUh\nBalZHw+TuwKBgHKQGa7fIMUT7izXesWlIvPdvVrOlqPwKH6bSIS5ZkGGAzd6lwsz\naX4Jctn81j3WT7Xs+TcNroi3ruV8eYAxr1MiVpnml6SS/UsOFF8qy7rp/NoMMe0W\nCUOgOTtjUHwfQg8SWRL/RvJiNxyRHXN6IkLtuS8XtzC0BZ9GARVS8yAVAoGBAIlQ\nqfPOYg+fN+pnYbEH/h7W7q+RanUmGtdcRMPK13wHWSIZGV5ocIgfhE3VZlFm8PDc\nU0TgKRuEHiF7Kg1FVhRBzX8fCMY73hKjNsq6DB49s8auyr5Xj6bOKPnKTzbsOsff\nHJaCob+eW1iTiBtu43cdNXhwiniETQB/AIyN3SujAoGAKZFMS9NfQ/xOccScMD6b\nBNEHudt6n3ZuKuskJitRl991BPS2+nHkPfVVkXh2P4+Gnv4l2QItEc9m3WeEGRnF\nW1SCRV/w+PnHvBzhw5C9upOqjl4qdl5AijxsfyT88tCLsizUxN20ZocliN/ay3B4\nyiKBWTJZrQsdWjVQ/1XAlEY=\n-----END PRIVATE KEY-----" == null ? void 0 : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCs5MhNNbAcdnNU\ntwSe5QueLdYSkhytKjedBnEq5aaDcpwpsClhCgHxdytfuhpX36wUP8571c2zGQcs\norl+p+u+gxARsEHj+6QEsodya56AIek97TFBcSwXFEomX0RwA7zC+6EogvQxJt+k\nVjiCcHaYMl0VljFpgJk4qLLtsHRnaZlZvFfsaDCj/FIzi7rx8Dhj/YmrmMk7rhkx\nyaQdqtPdOrQxv7xd8hE2DyQD7y0etIJlrKjh4xO57xeCKX/mat3bIzlaHfbEFEUD\n/GlOlTsEwwDqHR5g1qoZx85lMOhLSKV8rlWVOAPxXt/PRdpnuxjKiIc7pNSEYc3c\nEiLQivg3AgMBAAECggEAEd6iS/Ck9Nwn9sqPzLMpweiaPAMkDvXSbQVnGaLw1JyP\nmB4gDhU7DC+1U53oQ8rXffmg/YWkpBfjI5w8sI2UknVOFOCd1CgvKgPLIhVjes+G\ndvhsDd0vocG0GZvhIUlm737oh50Otix+vafiYVZUZk4A9vk2FDckHwoOAakqRCx8\nvaByXLZxqKD0ZNgfOb7kpWvR0ZQF5ZOD1fKE29rJhXlpqIMpOCHwGGGzEKPGGWP/\nFz+tTD4Svv0fGvZCjrvS7QJj0FXX9iJpNzP4ZcaEpZUoP+SaHIxdfnbLkAcvXXIk\nvNBMr4ZUoKO0Q/ypu6fNHbNM1cgDZfJypKZQRmNimQKBgQDbvAhp2wA/sE7DdANs\nw17OUxjqYnkT0qFycPXc90tAM9JHafc3tSxjEYu7dZOMYoxzNGqRn+Moe1kko7Ya\nK+peZhnwj2G6qD5CoXO2AEbE1QuuOSpCCSSgbvr/8586FbqI+ZSOrvyaf02eBOKR\nVHy81SNclmZkImvln/AkO32/tQKBgQDJba9+9kCidvylUYWBjFQ5fVR4FC5nqMQi\nrEeIrQT7/95/x92d+EImilYnH3PzlaQxSRBvUcvAePtIKmBkkdwPGojH45QZfaTT\nrJogLFIfz+Eg/bABBY1m2NWF6YJ8PCzJUVz3pZrPL8PlwAXFGeM8PliPps/PlfUh\nBalZHw+TuwKBgHKQGa7fIMUT7izXesWlIvPdvVrOlqPwKH6bSIS5ZkGGAzd6lwsz\naX4Jctn81j3WT7Xs+TcNroi3ruV8eYAxr1MiVpnml6SS/UsOFF8qy7rp/NoMMe0W\nCUOgOTtjUHwfQg8SWRL/RvJiNxyRHXN6IkLtuS8XtzC0BZ9GARVS8yAVAoGBAIlQ\nqfPOYg+fN+pnYbEH/h7W7q+RanUmGtdcRMPK13wHWSIZGV5ocIgfhE3VZlFm8PDc\nU0TgKRuEHiF7Kg1FVhRBzX8fCMY73hKjNsq6DB49s8auyr5Xj6bOKPnKTzbsOsff\nHJaCob+eW1iTiBtu43cdNXhwiniETQB/AIyN3SujAoGAKZFMS9NfQ/xOccScMD6b\nBNEHudt6n3ZuKuskJitRl991BPS2+nHkPfVVkXh2P4+Gnv4l2QItEc9m3WeEGRnF\nW1SCRV/w+PnHvBzhw5C9upOqjl4qdl5AijxsfyT88tCLsizUxN20ZocliN/ay3B4\nyiKBWTJZrQsdWjVQ/1XAlEY=\n-----END PRIVATE KEY-----".replace(/\\n/g, "\n")
    })
  });
} else {
  app = admin.apps[0];
}
const auth = admin.auth(app);
async function verifyIdToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "IDトークンの検証に失敗しました"
    };
  }
}
function createUserIdFromFirebase(firebaseUid) {
  return `firebase-${firebaseUid}`;
}
export {
  auth,
  createUserIdFromFirebase,
  verifyIdToken
};
