require('dotenv-flow').config()

const config = {
  cloudSearchEndpoint: process.env.CLOUD_SEARCH_ENDPOINT,
  cloudSearchDomainAPIVersion:process.env.CLOUD_SEARCH_DOMAIN_VERSION_API,
  cloudSearchRegion: process.env.CLOUD_SEARCH_REGION

}

module.exports = config
