pipeline {
    agent any


    environment {
            GITOPS_DIR = 'gitops-repo'
            IMAGE_NAME       = "noakhali/todo-frontend"
            IMAGE_TAG  = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()                       
    }
     stages {

        stage('SonarQube Analysis') {
            steps {
                    script {
                    def scannerHome = tool 'sonarscanner'
                    withSonarQubeEnv('sonarqube') {                   
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=todo-frontend \
                        -Dsonar.projectName=todo-frontend \
                        -Dsonar.sources=. \
                        -Dsonar.token=${env.SONAR_AUTH_TOKEN}
                    """
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Trivy File Scan') {
            steps {
                script {
                    sh 'echo "Running Trivy file scan on the source code"'
                    sh 'mkdir -p reports'
                    def trivyStatus = sh (
                        script: """
                        trivy fs . \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --ignore-unfixed \
                        --format table \
                        --output reports/trivy-file-scan.txt \
                        --no-progress
                        """,
                        returnStatus: true
                    )
                    // archive report regardless of scan result
                    archiveArtifacts artifacts: 'reports/*', fingerprint: true, allowEmptyArchive: true

                    // fail pipeline if vulnerabilities detected
                    if (trivyStatus != 0) {
                        error("Trivy detected HIGH/CRITICAL vulnerabilities in source code. See the report in Jenkins artifacts.")
                    }
                }
            }
        }
        stage('Build and Push Docker Image'){
            when { branch 'develop'}
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                sh """
                echo 'Building tag and push Docker Image'
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                """  
                }
            }
        }
        stage('Trivy Image Scan') {
            steps {
                script {
                    sh 'echo "Running Trivy scan on the Docker image"'
                    sh 'mkdir -p reports'
                    def trivyStatus = sh (
                    script: """
                    trivy image ${IMAGE_NAME}:${IMAGE_TAG} \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    --ignore-unfixed \
                    --format table \
                    --output reports/trivy-report.txt \
                    --no-progress
                    """,
                    returnStatus: true
                    )
                    // archive report regardless of scan result
                    archiveArtifacts artifacts: 'reports/*', fingerprint: true, allowEmptyArchive: true

                    // fail pipeline if vulnerabilities detected
                    if (trivyStatus != 0) {
                        error("Trivy detected HIGH/CRITICAL vulnerabilities. See the report in Jenkins artifacts.")
                    }
                }
            }
        }

        stage('Push Docker Image'){
            when { branch 'develop'}
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                sh """
                echo 'Pushing Docker Image'
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker push ${IMAGE_NAME}:${IMAGE_TAG}
                """  
                }
            }
        }

        stage('Test') {
            steps {
                sh 'echo "Running tests11"'
            }
        }
        stage('Deploy to Dev'){
            when {branch 'develop'}
            steps {
                script{
                //sh 'echo " deploy to dev coming soon"'
                updateGitOps('dev','todo-frontend', IMAGE_TAG)
                }

            }
        }
        stage('Deploy to stage'){
            when {branch 'staging'}
            steps {
                script {
                    //promotSameImagesDockerHub('staging')
                    def devImageTag = getCurrentImageTag('dev','todo-frontend')
                    promotSameImagesDockerHub('staging', devImageTag)
                    updateGitOps('staging','todo-frontend', devImageTag)
                    }
                }
        }
        stage('Deploy to Prod') {
            when {branch 'main'}
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                def devImageTag = getCurrentImageTag('staging','todo-frontend')
                promotSameImagesDockerHub('prod', devImageTag)
                updateGitOps('prod','todo-frontend', devImageTag)
                }
            }
        }

    }

}
def promotSameImagesDockerHub(String environment,String devImageTag) {
    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
        sh """
        echo 'old sha sourceSHA: ${devImageTag}'
        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
        docker pull ${IMAGE_NAME}:${devImageTag}
        docker tag ${IMAGE_NAME}:${devImageTag} ${IMAGE_NAME}:${environment}
        docker push ${IMAGE_NAME}:${environment}
        """
        if (environment == 'prod'){
            sh """
            docker tag ${IMAGE_NAME}:${devImageTag} ${IMAGE_NAME}:latest
            docker push ${IMAGE_NAME}:latest
            """
        }
    }


}
def updateGitOps(String environment, String service, String imageTag) {
    echo "Updating GitOps repo for ${environment}/${service} with image tag ${imageTag}"

    withCredentials([usernamePassword(
        credentialsId: 'github-token',
        usernameVariable: 'GIT_USER',
        passwordVariable: 'GIT_PASS'
    )]) {

        sh """
            set -e

            rm -rf '${GITOPS_DIR}'
            git clone "https://\$GIT_USER:\$GIT_PASS@github.com/lovelu99/todo-gitops-repo.git" '${GITOPS_DIR}'

            cd '${GITOPS_DIR}'

            git config user.email "jenkins@myorg.com"
            git config user.name "Jenkins CI"

            echo "Current directory: \$(pwd)"
            cd 'overlays/${environment}/${service}'

            
            sed -i "/name: noakhali\\/${service}/,/newTag:/ s/newTag:.*/newTag: ${imageTag}/" kustomization.yaml


            cd ../../..

            git add 'overlays/${environment}/${service}/kustomization.yaml'

            if git diff --cached --quiet; then
              echo "No changes to commit"
            else
              git commit -m 'ci: update ${environment}/${service} to ${imageTag} [skip ci]'
              git push "https://\$GIT_USER:\$GIT_PASS@github.com/lovelu99/todo-gitops-repo.git" main
            fi

            cd ..
            rm -rf '${GITOPS_DIR}'
        """
    }
}
def getCurrentImageTag(String environment, String service) {
    def imageTag = ''

    withCredentials([usernamePassword(
        credentialsId: 'github-token',
        usernameVariable: 'GIT_USER',
        passwordVariable: 'GIT_PASS'
    )]) {
        try {
            imageTag = sh(
                script: """
                    set -e

                    rm -rf '${GITOPS_DIR}'

                    git clone "https://\$GIT_USER:\$GIT_PASS@github.com/lovelu99/todo-gitops-repo.git" '${GITOPS_DIR}'

                    grep -A1 'name: noakhali/${service}' '${GITOPS_DIR}/overlays/${environment}/${service}/kustomization.yaml' \\
                        | grep 'newTag' \\
                        | awk '{print \$2}'
                """,
                returnStdout: true
            ).trim()
        } finally {
            sh "rm -rf '${GITOPS_DIR}'"
        }
    }

    echo "Current ${environment}/${service} image tag: ${imageTag}"
    return imageTag
}