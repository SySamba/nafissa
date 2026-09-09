# Guide SonarQube — Frontend + Backend Node (NAFISSA)

Sonar analyse le **JavaScript** des dossiers **`backend-node/src`** et **`frontend/src`**. Dans l’interface (SonarCloud ou SonarQube serveur), vous voyez :

- **Bugs** et fiabilité  
- **Vulnérabilités** et **failles de sécurité** (OWASP / injection, secrets, headers, etc. selon les règles activées)  
- **Code smells** et duplications  
- **Couverture de tests** (agrégée à partir des deux rapports LCov frontend et backend)

Un seul projet Sonar avec une seule clé : **`NAFISSA-Platform`** (`sonar.projectKey` dans **`sonar-project.properties`** à la racine — à faire correspondre au projet créé dans votre Sonar).

---

## 1 — SonarCloud (CI GitHub sans serveur dédié)

1. Connectez-vous sur [SonarCloud](https://sonarcloud.io/).  
2. Créez / importez un projet avec la même **`sonar.projectKey`** que dans le fichier **`sonar-project.properties`** (actuellement **`NAFISSA-Platform`** ou adaptez les deux côtés).  
3. Jeton : **Mon compte → Sécurité** → générer un jeton d’analyse.  
4. Sur GitHub : **Settings → Secrets and variables → Actions**  
   - **`SONAR_TOKEN`** : uniquement la chaîne du jeton (**`squ_…`** ou équivalent SonarCloud).  
   - **Supprimez** le secret **`SONAR_HOST_URL`** s’il existe (SonarCloud n’en a pas besoin ; une valeur **`localhost`** casse ou trompe la CI).  
5. Dans **`sonar-project.properties`**, décommentez et renseignez **pour SonarCloud uniquement** :

```properties
sonar.organization=VOTRE_ORG_SONARCLOUD
sonar.host.url=https://sonarcloud.io
```

6. Push sur **`main`** / **`master`** : **`.github/workflows/ci.yml`** exécute les tests, corrige les chemins **`lcov.info`**, puis lance **`SonarSource/sonarqube-scan-action@v6`** avec **`SONAR_TOKEN`**.

Les notifications e‑mail se configurent sous **Mon compte → Notifications** sur SonarCloud.

---

## 2 — SonarQube Server local ou sur votre réseau

### Sur votre PC (analyse locale)

1. Démarrez SonarQube (**Docker**, service Windows, etc.), interface souvent **`http://localhost:9000`**.  
2. Créez un projet avec la clé **`NAFISSA-Platform`** (identique à **`sonar.projectKey`** dans **`sonar-project.properties`**).  
3. **Mon compte → Sécurité** : créez un **token utilisateur** → collez-le dans une variable d’environnement **`SONAR_TOKEN`** (PowerShell : **`$env:SONAR_TOKEN="..."`**). Ne **commitez jamais** ce jeton ; si vous l’avez exposé dans un chat ou un ticket, **révoquez-le** et créez-en un autre.  
4. Après **`npm run test:coverage`** dans **`frontend`** et **`backend-node`**, à la racine du dépôt :

```powershell
cd C:\Users\HP\Downloads
afissatou
$env:SONAR_TOKEN = "VOTRE_JETON_ICI"
sonar-scanner "-Dsonar.host.url=http://127.0.0.1:9000"
```

(`127.0.0.1` ou **`localhost`** selon votre installation.)

### GitHub Actions et **`SONAR_HOST_URL`**

L’action officielle attend :

```yaml
env:
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

**Limite importante** : **`http://localhost:9000`** comme valeur du secret **`SONAR_HOST_URL`** **ne permet pas** à la CI GitHub (machine Linux dans le cloud) de joindre Sonar sur **votre ordinateur**. « localhost » sur le runner ≠ votre PC.

Pour que **GitHub Actions** envoie le rapport à **votre** SonarQube Server, il faut par exemple :

- une URL **accessible depuis Internet** (nom de domaine, IP publique, ou **tunnel** type Cloudflare Tunnel / ngrok vers le port 9000), **ou**  
- un **runner GitHub auto-hébergé** (_self-hosted_) sur la même machine ou le même LAN que Sonar.

Sinon : gardez Sonar **uniquement en local** pour vos scans manuels, et utilisez **SonarCloud** pour la CI (section 1).

---

## 3 — Récap : CI GitHub et Sonar sur votre PC

| Situation | Conduite à tenir |
|-----------|------------------|
| Sonar tourne sur **localhost:9000** sur votre machine | Utilisez **sonar-scanner** avec **SONAR_TOKEN** et **-Dsonar.host.url=http://127.0.0.1:9000**. Les secrets **SONAR_HOST_URL** sur GitHub ne servent pas à ça. |
| La CI GitHub doit pousser le rapport vers **votre** Sonar « chez vous » | Impossible avec **localhost** comme **SONAR_HOST_URL** sur les runners hébergés. Il faut une **URL publique** vers Sonar, un **runner auto-hébergé**, ou **SonarCloud** pour la CI. |

---

## 4 — À ne pas committer

- **Jamais** le token Sonar dans les fichiers : uniquement le secret GitHub **`SONAR_TOKEN`** ou une variable d’environnement locale.  
- **`node_modules/`** et **`coverage/`** : ignorés par `.gitignore` pour ne pas envoyer de bruit à Git ni à Sonar.

---

## 5 — Bonnes pratiques après une analyse

- Relancer Sonar après une grosse refacto ; traiter d’abord **bugs** puis **vulnérabilités**.  
- Les *faux positifs* peuvent être marqués **Won't fix** dans SonarCloud avec une courte justification pour l’équipe.  
- L’analyse complète prend souvent **1 à 3 minutes** : c’est normal.

---

## 6 — CI GitHub

Le workflow utilise **`SonarSource/sonarqube-scan-action@v6`** (version supportée par SonarSource).

**Présentation pour l’équipe** : **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.md`** (Word : **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.docx`**, ou **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS_nouveau.docx`** si l’original était ouvert au moment de la régénération).

---

## 7 — Dépannage CI et jetons

### **`SONAR_HOST_URL=http://localhost:9000`** dans les secrets GitHub

Les runners GitHub sont sur Internet : ils ne peuvent pas joindre **localhost sur votre PC**. Pour analyser depuis la CI vers SonarQube Server, **`SONAR_HOST_URL`** doit être une URL accessible depuis le réseau public, ou utilisez un runner auto-hébergé sur votre LAN. Sinon : analyse locale avec **`sonar-scanner`**, ou SonarCloud pour la CI (section 1).

### Couverture « aucune donnée » alors que les tests CI passent

Les rapports **`lcov.info`** utilisent souvent des chemins **`src/...`** relatifs au paquet (`frontend/` ou `backend-node/`). Sonar analyse depuis la **racine** du dépôt et attend des chemins du type **`frontend/src/...`**. Le workflow **`.github/workflows/ci.yml`** normalise ces chemins **avant** le scan ; après le prochain push sur `main` / `master`, la carte **Couverture** peut afficher des pourcentages.

### Jeton **`SONAR_TOKEN`** ≠ hash Git (**`31622e33…`**)

Un identifiant hexadécimal long (résumé d’un **commit** sur GitHub) **n’est pas** un jeton Sonar : ne pas le mettre dans **SONAR_TOKEN**. Utilisez un jeton créé dans **SonarQube** ou **SonarCloud** (**Mon compte** → **Sécurité**).

### « Failed to query JRE metadata » / « Unexpected char 0xe9 in Authorization value »

Le jeton HTTP ne doit contenir **que des caractères ASCII** (lettres, chiffres, `_`, etc.). Un accent (`é`) ou du texte collé avec le jeton corrompt l’en-tête **Authorization**. **Régénérez** le secret **`SONAR_TOKEN`** sur GitHub en collant **uniquement** la valeur affichée par SonarCloud (copie depuis le navigateur, pas depuis Word).

---

*Projet : API `backend-node` + interface `frontend`. Configuration Sonar **uniquement** à la racine : `sonar-project.properties`.*

