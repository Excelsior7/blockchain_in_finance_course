# Configuration Supabase pour l'application de certification blockchain

Ce dossier contient les configurations nécessaires pour utiliser Supabase comme base de données et système d'authentification pour l'application.

## Étapes de configuration

1. Créez un compte sur [Supabase](https://supabase.com/) et créez un nouveau projet.

2. Récupérez vos identifiants API (URL et clé anonyme) depuis le tableau de bord Supabase:
   - Dans votre projet Supabase, allez dans Settings > API
   - Copiez l'URL et la clé anon/public
   - Mettez à jour ces valeurs dans le fichier `src/supabase/client.ts`

3. Exécutez les scripts de migration SQL dans l'ordre suivant via l'éditeur SQL de Supabase:
   - `01_create_profiles_table.sql`
   - `02_create_completed_courses_table.sql`

## Structure des tables

### Table profiles

Cette table stocke les informations supplémentaires des utilisateurs, liées à leur compte d'authentification:

- `id`: Identifiant unique de l'utilisateur (provient de auth.users)
- `username`: Nom d'utilisateur unique
- `wallet_address`: Adresse du portefeuille Ethereum de l'utilisateur
- `created_at`: Date de création du profil
- `updated_at`: Date de dernière mise à jour du profil

### Table completed_courses

Cette table stocke les informations sur les cours que les utilisateurs ont complétés:

- `id`: Identifiant unique du cours complété
- `user_id`: Identifiant de l'utilisateur qui a complété le cours
- `course_id`: Identifiant du cours complété
- `tx_hash`: Hash de la transaction blockchain pour la certification
- `completed_at`: Date à laquelle le cours a été complété
- `created_at`: Date d'enregistrement dans la base de données

## Sécurité

Les deux tables utilisent Row Level Security (RLS) pour s'assurer que les utilisateurs ne peuvent accéder qu'à leurs propres données:

- Pour la table `profiles`, les utilisateurs peuvent voir et mettre à jour uniquement leur propre profil.
- Pour la table `completed_courses`, les utilisateurs peuvent voir uniquement leurs propres cours complétés et en ajouter de nouveaux. 