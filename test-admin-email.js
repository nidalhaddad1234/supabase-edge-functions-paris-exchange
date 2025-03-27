
// Script pour tester la fonction Edge send-email-notification
// Exécutez ce script avec: node test-admin-email.js

const fetch = require('node-fetch');

// Remplacez par l'URL où votre fonction est déployée
const FUNCTION_URL = 'http://localhost:54321/functions/v1/send-email-notification';

// Données de test
const testData = {
  to: "votre-email@example.com", // Remplacez par votre adresse email pour recevoir le test
  subject: "TEST - Nouvelle commande de devise #TEST123",
  order_data: {
    order_id: "TEST123",
    first_name: "Jean",
    last_name: "Dupont",
    email: "client@example.com",
    phone: "+33 6 12 34 56 78",
    operation_type: "Achat",
    from_amount: "100",
    from_currency: "EUR",
    to_amount: "110",
    to_currency: "USD",
    taux: "1.10",
    remarques: "Ceci est un test de l'email administratif"
  }
};

// Fonction pour envoyer la requête de test
async function testFunction() {
  try {
    console.log("Envoi de la requête de test à la fonction send-email-notification...");
    
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Succès! La fonction a répondu:");
      console.log(result);
    } else {
      console.error("❌ Erreur! La fonction a répondu avec une erreur:");
      console.error(result);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la requête:", error.message);
  }
}

testFunction();
