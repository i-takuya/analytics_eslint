const rp = require('request-promise')
const co = require('co')
let logger = require('./logger')

module.exports = class GithubRequest {
    constructor(token) {
        this.token = 'token ' + token
    }

    getRequest(path, detailed) {
        var options = {
            uri: 'https://api.github.com/' + path,
            resolveWithFullResponse: detailed,
            headers: {
                'Authorization': this.token,
                'User-Agent': 'test client'
            },
            json: true
        }

        return rp(options)
    }

    getRawFile(org, repo, eslintrc) {
        var options = {
            uri: 'https://raw.githubusercontent.com/' + org + '/' + repo + '/master/' + eslintrc
        }
        logger.request.debug(options)
        return rp(options)
    }
    
    getOrgRepoList(org) {
        // ex) https://api.github.com/orgs/npm/repos
        return this.getRequest('orgs/' + org + '/repos', true)
    }

    getRepoName(org) {
        let self = this
        return this.getOrgRepoList(org).then(function(contents) {
            let reponames = []
            let paths = []
            let nextlink = contents.headers['link']
            if (nextlink !== undefined) {
                let paths = GithubRequest.createPagenate(contents.headers['link'])
                return paths
            } else {
                paths.push('orgs/' + org + '/repos')
                return paths
            }
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
                    logger.request.debug(org, contents[step])
                    let lang = yield this.getLang(org, contents[step])
                    langs.push(lang)
                }
            })
            return langs
        }).catch(function(err) {
            logger.request.debug(err)
        })
    }

    getEslintrc(org, repo, eslintrc) {
        return this.getRawFile(org, repo, eslintrc).then(function(content) {
            console.log(content)
            return true
        }).catch(function() {
            logger.request.debug('not exist maybe')
        })
    }
    
    static createPagenate(link) {
        // <https://api.github.com/organizations/69631/repos?page=2>; rel="next",
        // <https://api.github.com/organizations/69631/repos?page=6>; rel="last"
        // get last page num and url
        let matched = /.+(organizations\/\d+\/repos\?page=)(\d)+>; rel="last"$/.exec(link)
        let path = matched[1]
        let lastPage = matched[2]
        // create list of paths
        let paths = [];
        for (let i = 1; i <= Number(lastPage);i++) {
            paths.push(path + i.toString())
        }
        // return url
        return paths
    }
}
