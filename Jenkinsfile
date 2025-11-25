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
    stage('Install') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh 'node -v'
          sh 'npm -v'
          sh 'npm install'
        }
      }
    }

    stage('Quality') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh 'npm run lint'
          sh 'npm test'
        }
      }
    }

    stage('Build') {
      steps {
        nodejs(nodeJSInstallationName: 'NodeJS') {
          sh 'npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker version'
        sh 'docker build -t weatherapi-showcase:local .'
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

