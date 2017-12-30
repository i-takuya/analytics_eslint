const rp = require('request-promise')
const co = require('co')

module.exports = class GithubRequest {
    constructor(token) {
        this.token = 'token ' + token
    }

    getRequest(path) {
        var options = {
            uri: 'https://api.github.com/' + path,
            headers: {
                'Authorization': this.token,
                'User-Agent': 'test client'
            },
            json: true
        }

        return rp(options)
    }

    getRawFile(org, repo) {
        var options = {
            uri: 'https://raw.githubusercontent.com/' + org + '/' + repo + '/master/.eslintrc.yaml'
        }

        return rp(options)
    }
    
    getOrgRepoList(org) {
        // https://api.github.com/orgs/npm/repos
        return this.getRequest('orgs/' + org + '/repos')
    }

    getRepoName(org) {
        return this.getOrgRepoList(org).then(function(contents) {
            // jsons = JSON.parse(content)
            let reponames = []
            for(let step = 0; step < contents.length; step++) {
                reponames.push(contents[step].name)
            }
            return reponames
        })
    }

    getLang(org, repo) {
        return this.getRequest('repos/' + org + '/' + repo + '/languages')
    }
    
    getLangbyOrg(org) {
        // repos/npm/$i/languages
        return this.getRepoName(org).then(function(contents) {
            let langs = []
            co(function *() {
                for(let step = 0; step < contents.length; step++) {
                    console.log(org, contents[step])
                    let lang = yield this.getLang(org, contents[step])
                    langs.push(lang)
                }
            })
            return langs
        }).catch(function(err) {
            console.log(err)
        })
    }

    getEslintrc(org, repo) {
        return this.getRawFile(org, repo).then(function(content) {
            console.log(content)
            return true
        }).catch(function() {
            console.log('not exist maybe')
        })
    }    
}
