# Présentation — GitHub & SonarCloud (projet NAFISSA)

**À qui s’adresse ce document** : dirigeants, chefs de projet, membres de l’équipe technique et toute personne qui doit **comprendre le dispositif qualité**, sans jargon inutile.  
**Objectif** : expliquer **l’utilité** de ces outils, **le déroulé** d’une mise à jour du code jusqu’au tableau SonarCloud, et **ce que nous considérons comme de bons indicateurs**.

---

## 1. Attention : erreur très fréquente (secret GitHub)

Une chaîne comme **`31622e33adfa9f520f1677659792ec0a12ccf2ab`** est un **identifiant de commit Git** : elle sert à repérer **une version précise du code**. Ce n’est **pas** un mot de passe ni un jeton SonarCloud.

- **À coller dans le secret GitHub `SONAR_TOKEN`** : uniquement le **jeton d’analyse** fourni par SonarCloud — une longue chaîne du type **`squ_...`** ou **`sqp_...`**, sans guillemets ni texte autour (*Mon compte* → **Sécurité** → génération de jeton).

Si vous voyez bien le tableau de projet sur SonarCloud (analyse récente, indicateurs affichés), **l’analyse fonctionne**. Le problème peut venir d’un autre jeton utilisé dans un ancien secret : ce n’est alors pas urgent de modifier quoi que ce soit tant que la CI passe.

---

## 2. Pourquoi nous utilisons GitHub

| Besoin organisationnel | Ce que GitHub apporte concrètement |
|------------------------|-----------------------------------|
| **Traçabilité** | Qui a modifié quoi et quand ; possibilité de revenir en arrière. |
| **Travail à plusieurs** | Partage du même code maître, validations avant intégration. |
| **Validation du code avant fusion** | Les demandes de fusion (*pull requests*) permettent une lecture du changement avant qu’il ne rejoigne la branche principale. |
| **Automatisation** | **GitHub Actions** peut lancer automatiquement des contrôles (construction, tests, analyse de qualité) à chaque envoi vers le dépôt. |

---

## 3. Pourquoi GitHub Actions sur ce projet ?

À chaque envoi (**push**) ou mise à jour d’une **demande de fusion**, notre fichier **`.github/workflows/ci.yml`** enchaîne notamment :

1. **Interface web (*frontend*)** : vérifications de style, construction, tests avec fichier de couverture.  
2. **API (*backend-node*)** : préparation de la couche données, puis tests avec couverture.  
3. **Analyse SonarCloud** : envoi du résultat des contrôles et des fichiers de couverture pour alimenter le tableau de bord.

**Intérêt** : faire remonter un problème **tôt**, au moment où le changement est proposé, plutôt qu’après mise en ligne.

---

## 4. Pourquoi SonarCloud ?

Les **tests** vérifient le **comportement** attendu. Des **contrôles automatiques dans l’éditeur** ou à la chaîne (*lint*) appliquent des règles de forme ou de conventions sur le fichier.

**SonarCloud** complète ces éléments en analysant tout le périmètre déclaré du projet : recherche de **risques de sécurité** et de **fiabilité**, suivi du **nombre d’anomalies**, des **doublons** de code, et de la **couverture par les tests**.

Ce n’est **pas** une garantie à 100 % : il reste la relecture humaine et les tests fonctionnels en conditions réelles. C’est une **boussole commune**, visible par toute l’équipe.

---

## 5. Déroulé — de la mise à jour du code au tableau de bord

```
Modification envoyée vers GitHub
              |
              v
+---------------------------+
|   GitHub Actions          |
|---------------------------|
|  Interface : tests etc.    |
|  API       : tests etc. |
|  Analyse SonarCloud       |
+-------------+-------------+
              |
              v
      Connexion sécurisée vers SonarCloud
      (avec le jeton secret SONAR_TOKEN, stocké uniquement dans GitHub)
              |
              v
 Tableau de bord SonarCloud (indicateurs, anomalies, synthèses)
```

Le secret **`SONAR_TOKEN`** défini dans GitHub (**Paramètres** → **Secrets**) sert uniquement à **authentifier l’analyse** ; il ne doit **jamais** figurer dans le code source ni dans une pièce jointe non protégée.

---

## 6. Que signifient les informations sur votre écran SonarCloud ?

D’après le type de vue que vous avez (**Quality Gate**, notes par lettre, etc.) :

### 6.1 Quality Gate (« seuil global »)

- **Réussi (*Passed*)** : la configuration Sonar utilisée applique plusieurs conditions ; votre dernière analyse les respecte globalement pour la branche considérée (souvent *main* ou la branche liée au dépôt).  
- **Échoué** : au moins une condition n’est pas remplise ; à traiter selon les règles internes avant une livraison sensible.

Une **Quality Gate verte** peut coexister avec une **note de sécurité basse (*E*, par exemple)** sur tout le code accumulé sur la durée : les conditions du seuil portent souvent sur le **nouveau** code ou des limites différentes. Il convient donc de lire aussi la section **problèmes de sécurité** et leur gravité (**bloquant**, **élevée**, etc.).

### 6.2 Les notes lettres (**A** à **E**)

Résumées par domaine : **sécurité**, **fiabilité**, **maintenabilité** (les libellés peuvent être en français ou en anglais selon votre interface).

| Lettre | Lecture simple |
|--------|----------------|
| **A** | Situation forte sur cet axe pour le périmètre mesuré |
| **B** | Satisfaisante — quelques anomalies à corriger progressivement |
| **C** | À surveiller — planifier des actions |
| **D–E** | Situation sérieuse à planifier (surtout sécurité) |

Une note **« UN » ou non affichée** sur la **maintenabilité** peut apparaître selon versions ou filtres : se fier surtout au **nombre d’anomalies** et à leur évolution dans le temps.

### 6.3 Couverture par les tests (« Couverture »)

Elle mesure **quelle part du code source déclaré** est traversée au moins une fois par les tests automatisés.  
Si le message indiquait « **aucune donnée** », c’est en général un **écart entre les chemins des fichiers** dans les rapports de tests et ceux analysés — corrigé côté intégration continue pour nos prochains envois ; après le prochain cycle d’analyse, un pourcentage devrait pouvoir apparaître une fois les rapports correctement reliés aux fichiers.

---

## 7. Vers quoi nous tendons comme « bons résultats » (objectifs équipe)

Ces niveaux peuvent être ajustés ensemble avec le pilote technique ; ils servent **d’alignement**.

| Domaine | Cible générale | Commentaire |
|---------|-----------------|------------|
| **Quality Gate** | Maintenir **Réussi** sur la branche principale | En cas d’échec, traiter avant une livraison critique. |
| **Sécurité** | Améliorer la note et **réduire** les anomalies **bloquantes** et **élevées** sur le **nouveau** code | Traiter les points **à réviser** (*hotspots*) dans l’interface. |
| **Fiabilité** | Note **A** ou **B**, baisse du nombre d’anomalies ouvertes | Prioriser le **bloquant** et l’**élevé**. |
| **Maintenabilité** | Progression maîtrisée | Ne pas viser zéro anomalie immédiatement : **réduire** la dette par itérations. |
| **Couverture** | Progression sur le long terme (ex. **au‑delà de 50 %** puis objectif plus haut) | Le pourcentage seul ne suffit pas ; il accompagne les tests existants. |
| **Duplications** | Rester sous les limites fixées par le seuil Sonar ou par l’équipe | Moins de copier‑coller limite les erreurs répétées. |

**Principe utile** : **ne pas dégrader** le nouveau code — traiter d’abord ce qui est introduit par les derniers changements, puis assainir l’historique.

---

## 8. Pourquoi vous ne recevez peut‑être pas d’e‑mail

SonarCloud **n’envoie pas systématiquement** un courriel à chaque analyse. Les alertes dépendent de votre **compte** et des **abonnements** :

- **Mon compte** → **Notifications** (ou équivalent) : activer les alertes souhaitées (échec de seuil, nouveaux problèmes, etc.).  
- Vérifier les **indésirables** (*courrier indésirable*) et l’adresse utilisée pour le compte.

Le suivi le plus fiable reste d’ouvrir le **projet** sur SonarCloud et l’onglet **Actions** sur GitHub pour voir si la dernière exécution s’est bien terminée.

---

## 9. Si l’analyse échoue avec « Unexpected char 0xe9 dans Authorization »

Cela indique un caractère non autorisé (souvent un **é** ou un texte collé par erreur) dans le secret **`SONAR_TOKEN`**. Recréez le jeton SonarCloud, copiez **uniquement** la valeur du jeton depuis le navigateur, et mettez à jour le secret sur GitHub.

---

## 10. Synthèse

- **GitHub** centralise le code et déclenche les contrôles automatiques.  
- **SonarCloud** fournit une **photo** et une **suite** mesurable de qualité et de sécurité.  
- **De bons résultats** pour nous : seuil principal **Réussi**, amélioration continue des anomalies **les plus graves**, hotspots de sécurité **revus**, et couverture des tests qui **augmente**.

---

## 11. Documents du dépôt

| Fichier | Utilité |
|---------|---------|
| `GUIDE_UTILISATION.md` | Installation et utilisation de l’application. |
| `GUIDE_SONARQUBE.md` | Détail technique Sonar et intégration continue. |
| `PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.docx` | Version Word pour réunion ou partage (régénérée depuis ce fichier Markdown). |

Régénérer le fichier Word après modification de ce fichier :

```text
python scripts/md/_presentation_to_docx.py
```

Si **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.docx`** est ouvert dans Word (fichier verrouillé), le script crée **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS_nouveau.docx`** à la place.

*NAFISSA — présentation interne (GitHub et SonarCloud).*
