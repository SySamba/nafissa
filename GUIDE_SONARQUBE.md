# Guide SonarQube — Frontend + Backend Node (NAFISSA)

Sonar analyse le **JavaScript** des dossiers **`backend-node/src`** et **`frontend/src`**. Dans l’interface (SonarCloud ou SonarQube serveur), vous voyez :

- **Bugs** et fiabilité  
- **Vulnérabilités** et **failles de sécurité** (OWASP / injection, secrets, headers, etc. selon les règles activées)  
- **Code smells** et duplications  
- **Couverture de tests** (agrégée à partir des deux rapports LCov frontend et backend)

Un seul projet Sonar avec une seule clé : **`nafissa-platform`** (`sonar.projectKey` dans `sonar-project.properties` à la racine).

---

## 1 — SonarCloud (recommandé avec GitHub)

1. Connectez-vous sur [SonarCloud](https://sonarcloud.io/) avec votre compte GitHub.  
2. **Créez une organisation** (ou utilisez votre org perso).  
3. **Importez le projet** `SySamba/nafissa` (ou analysez sans import en créant un projet manuellement avec la même clé que dans `sonar-project.properties`).  
4. Générez un **token d’analyse** : *My Account → Security*.  
5. Dans GitHub : **Repository → Settings → Secrets and variables → Actions → New repository secret**  
   - Nom : `SONAR_TOKEN`  
   - Valeur : le token SonarCloud.  
6. Éditez **`sonar-project.properties`** à la racine du dépôt : décommentez et renseignez :

```properties
sonar.organization=VOTRE_ORG_SONARCLOUD
sonar.host.url=https://sonarcloud.io
```

7. Commitez et poussez : le workflow **`.github/workflows/ci.yml`** exécute les tests, produit **`lcov.info`** côté `frontend/` et `backend-node/`, puis envoie l’analyse avec :

```properties
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info,backend-node/coverage/lcov.info
```

Après quelques minutes, ouvrez le tableau de projet sur SonarCloud : onglets **Issues**, **Security**, **Measures**, **Coverage**.

---

## 2 — SonarQube serveur privé

1. Déployez SonarQube (Docker, ZIP, Helm, etc.) et créez un projet avec la même **`sonar.projectKey`** que localement ou laissez le scanner la créer.  
2. Générez un **token** utilisateur avec droit d’analyse.  
3. Dans **`sonar-project.properties`**, renseignez l’URL de votre serveur :

```properties
sonar.host.url=https://votre-sonar.example.com
```

4. Le secret GitHub **`SONAR_TOKEN`** contient ce token ; le même workflow **`ci.yml`** s’utilise tel quel.

---

## 3 — Analyse en local

```powershell
# Depuis la racine du projet, après avoir lancé les tests avec couverture :
cd C:\Users\HP\Downloads\nafissatou\frontend
npm run test:coverage

cd ..\backend-node
npm run test:coverage

cd ..
# Définissez SONAR_TOKEN (PowerShell)
$env:SONAR_TOKEN = "sqxxxxxxxx"
sonar-scanner
```

Installez [SonarScanner](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/) et ajoutez `sonar.login` désormais obsolète — le CLI lit **`SONAR_TOKEN`**.

Pour SonarCloud en local, `sonar.organization` et `sonar.host.url` doivent être présents dans `sonar-project.properties`.

---

## 4 — À ne pas committer

- Ne mettez **jamais** le token Sonar dans `sonar-project.properties` ou dans le code ; utilisez **`SONAR_TOKEN`** (CI ou variable d’environnement locale).  
- Les dossiers **`coverage/`** et **`node_modules/`** sont listés dans **`.gitignore`**.

---

*Projet : API `backend-node` + interface `frontend`. Ancien dossier Laravel `backend/` retiré.*
