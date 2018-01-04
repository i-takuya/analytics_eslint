let GithubClient = require('./lib/github-request')
const co = require('co')
let client = new GithubClient('<api key>')
let org = 'screwdriver-cd'
let logger = require('./lib/logger')

if (process.argv[2] !== undefined) {
    org = process.argv[2]
}

client.getRepoName(org).then(function(paths) {
    let langs = []
    let reponames = []
    let eslintrcs = ['.eslintrc', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.js']
    logger.request.debug(paths)
    co(function *() {
        for(let path of paths) {
            let repos = yield client.getRequest(path);
            logger.request.debug(repos.length)
            for(let step = 0; step < repos.length; step++) {
                reponames.push(repos[step].name)
            }        
        }
        for(let step = 0; step < reponames.length; step++) {
            let lang = yield client.getLang(org, reponames[step])
            logger.request.debug(lang)
            if ('JavaScript' in lang || 'TypeScript' in lang) {
                logger.request.debug(lang['JavaScript'])
                console.log(reponames[step])
                for (eslintrc of eslintrcs) {
                    let exist = yield client.getEslintrc(org, reponames[step], eslintrc)
                    if (exist) {
                        let msg = org + '/' + reponames[step] + ' has ' + eslintrc
                        logger.request.debug(msg)
                        break;
                    }
                }
            }
        }
    })
    logger.request.debug(langs)
}).catch(function(err) {
    logger.request.error(err)
})

