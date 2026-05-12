# Présentation — GitHub & SonarCloud (projet NAFISSA)

**Public** : toute personne qui n’a jamais (ou peu) utilisé GitHub Actions ni SonarCloud.  
**Objectif** : expliquer **pourquoi** ces outils, **comment** ils s’enchaînent dans notre projet, et **quel niveau de résultat** nous visons sur SonarCloud.

---

## 1. Pourquoi GitHub ?

| Besoin | Ce que GitHub apporte |
|--------|----------------------|
| **Historique du code** | Chaque modification est traçée (qui, quand, quel message). Annulation ou comparaison possibles. |
| **Collaboration** | Plusieurs développeurs travaillent sur les mêmes fichiers avec des branches et des fusions contrôlées. |
| **Revue avant fusion** | Les *pull requests* permettent de relire le code avant de l’intégrer dans la branche principale. |
| **CI intégrée** | **GitHub Actions** lance automatiquement des tâches (tests, lint, analyse Sonar) à chaque push ou PR — sans rien installer sur les ordinateurs de l’équipe pour la suite de base. |

En résumé : GitHub = **référentiel officiel du code** + **automatisation** autour des changements.

---

## 2. Pourquoi GitHub Actions dans notre projet ?

Nous voulons **détecter les problèmes tôt**, à chaque changement :

1. Le frontend passe par **eslint**, **build** et **tests avec couverture**.  
2. Le backend Node passe par **génération Prisma** puis **tests avec couverture**.  
3. Les rapports de couverture sont conservés puis **SonarScanner** les envoie à SonarCloud.

**Intérêt** : une erreur vue sur GitHub (badge rouge sur la CI) = le problème est identifié **avant** ou **pendant** la revue, pas seulement en production.

Fichier de définition : `.github/workflows/ci.yml`.

---

## 3. Pourquoi SonarCloud ?

Les **tests** répondent à la question : « Le comportement attendu fonctionne-t-il ? »  
Les **lints** (comme ESLint) répondent à : « Respectons-nous des règles de style évidentes ? »  

**SonarCloud** ajoute une couche :  

- recherche de **patterns risqués** (sécurité, fiabilité) sur tout le périmètre analysé ;  
- suivi dans le temps des **bugs**, **vulnérabilités**, **code smells**, **duplications** ;  
- **couverture de tests** intégrée au tableau de projet (avec nos fichiers LCov frontend + backend) ;  
- possibilité d’associer une **Quality Gate** (seuils officiels qui passent ou échouent).

Ce n’est **pas** un remplacement des tests ou de la relecture humaine : c’est un **coach mesurable et partagé** par l’équipe.

---

## 4. Chaîne complète : du push au tableau SonarCloud

Représentation simple (sans outil graphique externe) :

```
Developer push / Pull Request sur GitHub
              |
              v
+---------------------------+
|   GitHub Actions (CI)     |
|---------------------------|
|  Job Frontend             |
|    lint -> build -> tests -> lcov.info
|                           |
|  Job Backend-node         |
|    prisma generate -> tests -> lcov.info
|                           |
|  Job SonarCloud Scan      |
|    télécharge les lcov    |
|    sonar-scanner (+ token) |
+-------------+-------------+
              |
              v
      SonarCloud (API HTTPS)
              |
              v
 Tableau projet : métriques, issues, sécurité, couverture
```

**Point clé** : le secret **`SONAR_TOKEN`** (défini dans GitHub → *Settings → Secrets*) est la « carte d’identité » utilisée uniquement dans la CI pour authentifier l’analyse. Il ne doit **jamais** apparaître dans le dépôt.

---

## 5. Indicateurs SonarCloud : comment lire l’interface ?

### 5.1 Les notes lettres (**A à E**, « Ratings »)

Sur plusieurs dimensions — **Fiabilité**, **Sécurité**, **Maintenabilité** :

| Note | Idée vulgarisée |
|------|----------------|
| **A** | Excellent : très peu ou pas de points bloquants sur ce volet |
| **B** | Correct / bon |
| **C** | Moyen : dette perceptible ; prioriser progressivement les correctifs |
| **D–E** | Dégradé : il faut planifier une action forte (souvent plusieurs issues groupées) |

### 5.2 **Quality Gate**

C’est une **liste de conditions** configurée dans SonarCloud (ou le défaut Sonar : *Sonar way*).  

- **PASSED** = l’analyse satisfait tous les seuils du gate (exemple type : pas de nouvelle vulnérabilité bloquante sur le *nouveau* code).  
- **FAILED** = au moins une condition rouge : à traiter selon les règles de l’équipe avant de considérer la livraison « valide niveau Sonar ».

### 5.3 Compteurs d’issues

- **Bugs** : comportements jugés incorrects par l’analyseur.  
- **Vulnérabilités** : problèmes de sécurité relevés par les règles (priorité forte).  
- **Code smells** : maintenabilité / clarté (souvent moins urgent mais utile pour la dette).

---

## 6. Les « bons résultats » que nous visons comme équipe (objectifs pragmatiques)

Les chiffres exacts peuvent être ajustés par le lead technique, mais l’ambition doit être **clair et partagée** :

| Thème | Cible équipe indicative | Commentaire |
|--------|------------------------|------------|
| **Quality Gate** | **Passed** régulièrement sur `main` | Si FAILED, corriger avant de fermer une release critique (ou traiter sous 1 sprint selon votre politique). |
| **Sécurité (note + issues)** | **Note A ou B**, **0 vulnérabilité bloquante** sur le nouveau code | Les hotspots de sécurité doivent être **revus** (acceptés ou corrigés) pour ne pas laisser de dette anonyme. |
| **Fiabilité** | **Note A ou B**, réduction progressive des bugs | Prioriser tout ce qui est **High / Blocker**. |
| **Maintenabilité** | Au moins **B** ou plan de réduction du *technical debt ratio* | Ne pas tout « à zéro smell » d’un coup : garder une courbe descendante sprint après sprint. |
| **Couverture** | Hausse progressive (exemple : viser **> 50 % puis > 65 %** sur le périmètre mesuré après stabilisation du projet) | La couverture seule ne garantit pas la qualité, mais évite les zones sans filet de tests. |
| **Duplications** | Rester sous le seuil du Quality Gate Sonar ou objectif équipe communiqué | Moins de copier‑coller = moins d’erreurs répliquées. |
| **Nouveau code** | « Clean as you code » Sonar : peu ou pas de **nouvelle** issue bloquante sur les lignes ajoutées | Principe : **ne pas dégrader** la base en livrant vite. |

> **Réalité** : un ancien projet peut avoir encore des odeurs anciennes ; ce qui compte d’abord, c’est de **stopper la dérive** sur le nouveau code puis de faire baisser l’historique avec le temps.

---

## 7. Rôles précis dans notre dépôt

| Élément | Rôle |
|---------|------|
| `sonar-project.properties` (**racine**) | Clé projet, organisation SonarCloud, dossiers analysés (`backend-node/src`, `frontend/src`), chemins vers les deux fichiers **`lcov.info`**. |
| Secret **`SONAR_TOKEN`** | Valeur du token créé dans SonarCloud (compte utilisateur ou jeton projet) — uniquement ASCII, voir § 8. |

---

## 8. Erreur CI : « Unexpected char 0xe9 in Authorization value » (SONAR_TOKEN)

Le caractère **0xe9** correspond à **`é`** (accent). Le scanner construit une en‑tête **Authorization** envoyée à l’API SonarCloud : elle doit être **compatible ASCII** avec le jeton officiel.

**Cause la plus fréquente** : la valeur du secret GitHub **`SONAR_TOKEN`** contient un caractère non ASCII :

- texte français collé avec le jeton (« Jeton : sqp_xxx », « Token d’analyse… », guillemets typographiques **« »**, espaces ou retours lignes parasites) ;
- copie depuis **Word** ou **PDF**.

**À faire** :

1. SonarCloud → **My Account** → **Security** → générer un nouveau token ou copier celui utilisé pour l’analyse.  
2. Copier **uniquement** la chaîne du jeton (`sqp_...` ou similaire) dans le presse‑papiers — de préférence depuis le navigateur, pas depuis Word.  
3. GitHub → **Settings → Secrets and variables → Actions** → **`SONAR_TOKEN`** → **Update** avec cette seule valeur (pas de citation, pas de libellé).  
4. Relancer la workflow **SonarCloud Scan**.

---

## 9. Synthèse en une lecture

```
GitHub   = où vit le code + déclenche la CI après chaque modification.
Actions  = exécute tests, lint, build, envoie le tout à SonarCloud.
SonarCloud = tableau de mesure commun (qualité / sécurité / couverture).
Bons résultats = Gate verte + notes soutenables + aucune nouvelle vulnérabilité bloquante tolérée sur le périmètre livré + couverture qui monte lentement mais sûrement.
```

---

## 10. Ressources internes projet

| Document | Usage |
|---------|-------|
| `GUIDE_UTILISATION.md` | Installation, démarrage local, vue d’ensemble du dépôt. |
| `GUIDE_SONARQUBE.md` | Détails techniques Sonar + CI. |
| `PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.docx` | **Version Word** de cette présentation (mise en page pour réunion / partage). |

Pour **régénérer le Word** après modification du fichier `.md` :

```text
python scripts/md/_presentation_to_docx.py
```

---

*NAFISSA — présentation interne (GitHub, GitHub Actions, SonarCloud) — mise à jour continue.*
