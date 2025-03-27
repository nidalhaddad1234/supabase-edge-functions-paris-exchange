#!/bin/bash

# URL de la fonction (modifiez selon votre configuration)
FUNCTION_URL="http://localhost:54321/functions/v1/send-email-notification"

# Données de test - Remplacez l'email par votre propre adresse pour recevoir le test
curl -X POST $FUNCTION_URL \
  -H "Content-Type: application/json" \
  -d '{
    "to": "votre-email@example.com", 
    "subject": "TEST - Nouvelle commande de devise #TEST123",
    "order_data": {
      "order_id": "TEST123",
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "client@example.com",
      "phone": "+33 6 12 34 56 78",
      "operation_type": "Achat",
      "from_amount": "100",
      "from_currency": "EUR",
      "to_amount": "110",
      "to_currency": "USD",
      "taux": "1.10",
      "remarques": "Ceci est un test de l'email administratif"
    }
  }'
