package ploiu.fileserveruiandroid.inject.modules

import android.content.Context
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import ploiu.fileserveruiandroid.ServerConfig
import java.util.*

@Module
@InstallIn(SingletonComponent::class)
class ConfigModule {
    @Provides
    fun serverConfig(@ApplicationContext context: Context): ServerConfig {
        val props = Properties()
        context.assets.open("app.properties").use {
            props.load(it)
        }
        val host: String = props["server.address"] as String
        val port = (props["server.port"] as String).toInt()
        val baseUrl = "https://$host:$port"
        val compatibleVersion = props["server.compatible.version"] as String
        val username = props["server.username"] as String
        val password = props["server.password"] as String
        val gex = generateCompatibleVersionPattern(compatibleVersion)
        return ServerConfig(baseUrl, gex, compatibleVersion, host, port, username, password)
    }

    private fun generateCompatibleVersionPattern(versionPattern: String): Regex {
        // our regex builder will only work if the whole version follows the right property
        val versionMatcher = Regex("^\\d+(\\.(\\d+|x)){2}$")
        if (!versionMatcher.matches(versionPattern)) {
            throw RuntimeException("Bad compatible version $versionPattern. Version must follow the format #.(#|x).(#|x) format. e.g. 1.2.x")
        }
        val versionRegex = versionPattern.split("\\.".toRegex()).joinToString(separator = ".") {
            it.replace(
                "x",
                "\\d+"
            )
        }

        return Regex(versionRegex)
    }
}
