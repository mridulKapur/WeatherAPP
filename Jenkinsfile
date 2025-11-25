// Runs in a Docker container with Node 25 and required libs (avoids libatomic.so.1 issues on minimal Jenkins images).
// Requires: Jenkins with Docker Pipeline plugin; Docker available to Jenkins (e.g. Docker socket mounted).
// Alternative: To run on "agent any" with Node.js plugin, your Jenkins image must have libatomic1 installed
//   (e.g. in your Jenkins Dockerfile: RUN apt-get update && apt-get install -y libatomic1).
pipeline {
  agent {
    docker {
      image 'node:25'
      reuseNode true
      args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

  options {
    disableConcurrentBuilds()
  }

  environment {
    NODE_ENV = "test"
  }

  stages {
    stage('Install') {
      steps {
        sh '''
          echo "[DEBUG] === Install stage ==="
          echo "[DEBUG] hostname: $(hostname), user: $(whoami), uid=$(id -u)"
          echo "[DEBUG] PATH=$PATH"
          echo "[DEBUG] which node: $(which node), node: $(node -v)"
          echo "[DEBUG] which npm: $(which npm), npm: $(npm -v)"
          echo "[DEBUG] cwd: $(pwd)"
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

    stage('Quality') {
      steps {
        sh 'echo "[DEBUG] === Quality stage ===" && npm run lint'
        sh 'echo "[DEBUG] Running npm test" && npm test'
      }
    }

    stage('Build') {
      steps {
        sh 'echo "[DEBUG] === Build stage ===" && npm run build'
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
