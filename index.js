let GithubClient = require('./lib/github-request')
const co = require('co')
let client = new GithubClient('<readonly github api key>')
let org = 'screwdriver-cd'

client.getRepoName(org).then(function(contents) {
    let langs = []
    co(function *() {
        for(let step = 0; step < contents.length; step++) {
            let lang = yield client.getLang(org, contents[step])
            console.log(lang)
            if ('JavaScript' in lang) {
                console.log(lang['JavaScript'])
                let exist = yield client.getEslintrc(org, contents[step])
                if (exist) {
                    let msg = org + '/' + contents[step] + ' has exlintrc'
                    console.log(msg)
                }
            }
        }
    })
    console.log(langs)
}).catch(function(err) {
    console.log(err)
})

