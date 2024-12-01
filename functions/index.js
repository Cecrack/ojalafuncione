const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Permite todas las solicitudes

admin.initializeApp();

exports.getUsers = functions.https.onRequest((req, res) => {
  // Habilita CORS
  cors(req, res, async () => {
    try {
      // Verificación del token del usuario
      if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const token = req.headers.authorization.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Verificar si el usuario tiene permisos de administrador
      if (!decodedToken.admin) {
        return res.status(403).json({ error: "No tienes permisos para acceder a esta función." });
      }

      // Obtener usuarios
      const listUsersResult = await admin.auth().listUsers();
      const users = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || "Sin nombre"
      }));

      return res.status(200).json({ users });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
