#!/bin/bash

# Vérifier si l'argument de référence du projet est fourni
if [ -z "$1" ]; then
  echo "Erreur: Veuillez fournir la référence de votre projet Supabase."
  echo "Usage: ./deploy.sh votre-ref-projet"
  exit 1
fi

PROJECT_REF=$1
echo "Déploiement de la fonction send-email-notification vers le projet $PROJECT_REF..."

# Lier le projet
echo "Liaison du projet local au projet Supabase..."
supabase link --project-ref $PROJECT_REF

# Vérifier si la liaison a réussi
if [ $? -ne 0 ]; then
  echo "Erreur: La liaison au projet a échoué."
  exit 1
fi

# Déployer la fonction
echo "Déploiement de la fonction..."
supabase functions deploy send-email-notification

# Vérifier si le déploiement a réussi
if [ $? -ne 0 ]; then
  echo "Erreur: Le déploiement a échoué."
  exit 1
fi

echo "✅ Fonction send-email-notification déployée avec succès!"
echo "Pour tester, utilisez la commande curl suivante:"
echo "curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/send-email-notification \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"to\": \"votre-email@example.com\", \"subject\": \"TEST\", \"order_data\": {...}}'"
