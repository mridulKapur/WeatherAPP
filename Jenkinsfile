pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    // Never hardcode secrets here. Configure OPENWEATHER_API_KEY in Jenkins Credentials
    // and map it via "Credentials Binding" (recommended) in a real pipeline.
    NODE_ENV = "test"
  }

  stages {
    stage('Install') {
      steps {
        bat 'node -v'
        bat 'npm -v'
        bat 'npm install'
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

