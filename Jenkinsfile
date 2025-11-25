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
          echo "[DEBUG] User: $(whoami), uid=$(id -u), HOME=$HOME"
          echo "[DEBUG] Installing libatomic for Node.js 25 (libatomic.so.1)..."
          set +e
          if command -v apt-get >/dev/null 2>&1; then
            echo "[DEBUG] Using apt-get (Debian/Ubuntu)"
            if [ "$(id -u)" = "0" ]; then
              echo "[DEBUG] Running as root, using apt-get without sudo"
              apt-get update -qq && apt-get install -y libatomic1; RC=$?
            else
              echo "[DEBUG] Not root, trying sudo apt-get"
              sudo apt-get update -qq && sudo apt-get install -y libatomic1; RC=$?
            fi
            echo "[DEBUG] apt-get exit code: $RC"
          elif command -v apk >/dev/null 2>&1; then
            echo "[DEBUG] Using apk (Alpine)"
            if [ "$(id -u)" = "0" ]; then
              apk add --no-cache libatomic1 || apk add --no-cache libatomic; RC=$?
            else
              sudo apk add --no-cache libatomic1 || sudo apk add --no-cache libatomic; RC=$?
            fi
            echo "[DEBUG] apk exit code: $RC"
          elif command -v yum >/dev/null 2>&1; then
            echo "[DEBUG] Using yum (RHEL/CentOS)"
            if [ "$(id -u)" = "0" ]; then
              yum install -y libatomic; RC=$?
            else
              sudo yum install -y libatomic; RC=$?
            fi
            echo "[DEBUG] yum exit code: $RC"
          else
            echo "[DEBUG] No apt-get, apk, or yum found"
            RC=1
          fi
          set -e
          if [ -n "$(ldconfig -p 2>/dev/null | grep libatomic)" ] || [ -f /usr/lib/x86_64-linux-gnu/libatomic.so.1 ] || [ -f /lib/x86_64-linux-gnu/libatomic.so.1 ]; then
            echo "[DEBUG] libatomic.so.1 appears to be available"
          else
            echo "[DEBUG] WARNING: libatomic may not be installed (exit $RC). Node 25 may fail with 'libatomic.so.1' error."
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

