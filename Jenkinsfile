#!/usr/bin/groovy

node {
  def root = pwd()

  stage('Setup') {
    git url: 'https://github.com/StatEngine/stat-engine', branch: 'master'
  }

  stage('Archive') {
    sh """
      test -f /etc/runtime && source /etc/runtime

      npm install
      ./node_modules/gulp/bin/gulp.js build
      mkdir -p artifacts
      rm -rf artifacts/*
      tar --exclude artifacts/* -cjf artifacts/statengine.tar.bz2 .

      export ARTIFACT=artifacts/statengine.tar.bz2

      ./bin/s3Push.sh
    """
  }
}
