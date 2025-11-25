// Requires: Jenkins "Node.js" plugin + a NodeJS installation named "Node.js" in Global Tool Configuration.
// For Windows agents: install Node.js on the agent and ensure it is in PATH, or use a Linux agent.
pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  environment {
    NODE_ENV = "test"
  }

  stages {
    stage('Prepare') {
      steps {
        sh '''
          echo "[DEBUG] === Prepare stage ==="
          echo "[DEBUG] Agent hostname: $(hostname)"
          echo "[DEBUG] uname -a: $(uname -a)"
          echo "[DEBUG] User: $(whoami), HOME=$HOME"
          echo "[DEBUG] Installing libatomic for Node.js 25 (libatomic.so.1)..."
          if command -v apt-get >/dev/null 2>&1; then
            echo "[DEBUG] Using apt-get (Debian/Ubuntu)"
            sudo apt-get update -qq && sudo apt-get install -y libatomic1 || echo "[DEBUG] apt-get install libatomic1 failed or skipped"
          elif command -v yum >/dev/null 2>&1; then
            echo "[DEBUG] Using yum (RHEL/CentOS)"
            sudo yum install -y libatomic || echo "[DEBUG] yum install libatomic failed or skipped"
          else
            echo "[DEBUG] No apt-get or yum found; ensure libatomic is installed on the agent for Node 25"
          fi
          echo "[DEBUG] === Prepare done ==="
        '''
      }
    }

    stage('Install') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh '''
            echo "[DEBUG] === Install stage ==="
            echo "[DEBUG] PATH=$PATH"
            echo "[DEBUG] which node: $(which node 2>/dev/null || echo 'not found')"
            echo "[DEBUG] which npm: $(which npm 2>/dev/null || echo 'not found')"
          '''
          sh 'node -v'
          sh 'npm -v'
          sh '''
            echo "[DEBUG] Running npm install in $(pwd)"
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
        sh 'echo "[DEBUG] Building image from $(pwd)" && docker build -t weatherapi-showcase:local .'
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

