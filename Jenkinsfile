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
        stage("Build info") {
            steps {
                script {
                    def buildCause = currentBuild.getBuildCauses()
                    echo "buildCause: ${buildCause}"

                    C_TEXT = """
                        Job: ${JOB_NAME}
                        Build cause: ${buildCause.shortDescription[0]}
                    """

                    C_PROJECT = GIT_URL.substring(19,GIT_URL.length()-4)
                    echo C_PROJECT
                    echo C_TEXT
                    currentBuild.description = C_TEXT
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
                            name: 'ton_client_js_branch',
                            value: "master"
                            // value: "0.24.0-rc"
                        ],
                        [
                            $class: 'BooleanParameterValue',
                            name: 'CHANGE_JS_DEPS',
                            value: false
                            // value: true
                        ],
                        [
                            $class: 'StringParameterValue',
                            name: 'ton_client_node_js_branch',
                            value: "${GIT_BRANCH}"
                        ],
                        [
                            $class: 'StringParameterValue',
                            name: 'ton_client_node_js_commit',
                            value: "${GIT_COMMIT}"
                        ],
                        [
                            $class: 'BooleanParameterValue',
                            name: 'RUN_TESTS_ALL',
                            value: false
                        ],
                        [
                            $class: 'BooleanParameterValue',
                            name: 'RUN_TESTS_TON_CLIENT_NODE_JS',
                            value: true
                        ],
                    ] 

                    build job: "Integration/integration-tests/master", parameters: params
                }
            }
        }
    }
}
