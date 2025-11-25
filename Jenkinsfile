// Requires: Jenkins "Node.js" plugin + a NodeJS installation in Global Tool Configuration.
// IMPORTANT: Docker is not available on the agent. Use one of:
//   (1) Node 20 LTS in Global Tool Configuration (recommended) - avoids libatomic.so.1 dependency that Node 25 needs.
//   (2) Or add libatomic to your Jenkins image (Dockerfile: RUN apt-get update && apt-get install -y libatomic1).
pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  environment {
    NODE_ENV = "test"
  }

  stages {
    stage('Install') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh '''
            echo "[DEBUG] === Install stage ==="
            echo "[DEBUG] hostname: $(hostname), user: $(whoami), cwd: $(pwd)"
            echo "[DEBUG] which node: $(which node 2>/dev/null || echo not found)"
            echo "[DEBUG] which npm: $(which npm 2>/dev/null || echo not found)"
          '''
          sh 'node -v'
          sh 'npm -v'
          sh '''
            echo "[DEBUG] Running npm install"
            npm install
            echo "[DEBUG] npm install finished"
          '''
        }
      }
    }

    stage('Quality') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh 'echo "[DEBUG] === Quality stage ===" && npm run lint'
          sh 'echo "[DEBUG] Running npm test" && npm test'
        }
      }
    }

    stage('Build') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh 'echo "[DEBUG] === Build stage ===" && npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'echo "[DEBUG] === Docker Build stage ===" && docker version'
        sh 'echo "[DEBUG] Building from $(pwd)" && docker build -t weatherapi-showcase:local .'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: '**/junit.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: '**/coverage/**'
    }
  }
}
