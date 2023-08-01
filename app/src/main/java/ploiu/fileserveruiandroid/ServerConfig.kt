package ploiu.fileserveruiandroid

class ServerConfig(
    val baseUrl: String,
    val versionMatcher: Regex,
    val compatibleVersion: String,
    val host: String,
    val port: Int,
    val username: String,
    val password: String
)
