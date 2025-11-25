pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    NODE_ENV = "test"
  }

  stages {
    stage('Install') {
      steps {
        sh 'node -v'
        sh 'npm -v'
        sh 'npm install'
      }
    }

    stage('Quality') {
      steps {
        bat 'npm run lint'
        bat 'npm test'
      }
    }

    stage('Build') {
      steps {
        bat 'npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        bat 'docker version'
        bat 'docker build -t weatherapi-showcase:local .'
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

