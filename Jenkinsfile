G_giturl = "git@github.com:tonlabs/ton-client-node-js.git"
G_project = ""
G_reason = ""

def getVar(Gvar) {
    return Gvar
}

pipeline {
    agent any
    options { 
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '5')
        disableConcurrentBuilds()
        parallelsAlwaysFailFast()
    }
    stages {
        stage('Started') { 
            steps {
                script {
                    G_project = G_giturl.substring(15,G_giturl.length()-4)
                    G_reason = sh (script: "git show -s --format=%h ${GIT_COMMIT}", returnStdout: true).trim()
                    echo """Job: ${JOB_NAME}
                    Project: ${getVar(G_project)}
                    Commit: ${GIT_COMMIT}
                    Hash: ${getVar(G_reason)}"""
                }
            }
        }
        stage('Run tests') {
            steps {
                echo "Job: ${JOB_NAME}"
                script {
                    def params = [
                        [
                            $class: 'StringParameterValue',
                            name: 'ton_acquiring_branch',
                            value: "${GIT_BRANCH}"
                        ],
                        [
                            $class: 'StringParameterValue',
                            name: 'ton_jessie_branch',
                            value: "${GIT_BRANCH}"
                        ],
                    ] 

                    build job: "Integration/integration-tests/master", parameters: params
                }
            }
        }
    }
}