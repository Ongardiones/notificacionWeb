require('dotenv').config();  // Cargar variables de entorno

const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const subscriptions = []; // Guardar las suscripciones

// Usar las claves VAPID desde el archivo .env
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Configurar VAPID usando el correo desde .env
webpush.setVapidDetails(
  `mailto:${process.env.NOTIFICACION_EMAIL}`,  // Usar la variable de entorno para el correo
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Endpoint para suscripciones
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Suscripción guardada correctamente' });
});

// Endpoint para enviar notificaciones
app.post('/api/send', async (req, res) => {
  const { title, message } = req.body;
  const payload = JSON.stringify({ title, message });

  try {
    const results = await Promise.all(
      subscriptions.map(sub =>
        webpush.sendNotification(sub, payload).catch(err => console.error(err))
      )
    );
    res.status(200).json({ message: 'Notificaciones enviadas', results });
  } catch (err) {
    res.status(500).json({ message: 'Error al enviar notificaciones', error: err });
  }
});

// Levantar el servidor
app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});
