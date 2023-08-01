package ploiu.fileserveruiandroid.inject.modules

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import ploiu.fileserveruiandroid.ServerConfig
import ploiu.fileserveruiandroid.client.ApiClient
import ploiu.fileserveruiandroid.client.FolderClient
import retrofit2.Retrofit
import retrofit2.converter.jackson.JacksonConverterFactory
import java.util.*

@Module
@InstallIn(SingletonComponent::class)
class HttpModule {

    @Provides
    fun retrofit(config: ServerConfig): Retrofit {
        val client = OkHttpClient.Builder()
        val creds = "${config.username}:${config.password}"
        client.addInterceptor { chain ->
            val req = chain.request()
                .newBuilder()
                .addHeader("Authorization", "Basic ${Base64.getEncoder().encodeToString(creds.encodeToByteArray())}")
                .build()
            chain.proceed(req)
        }
        return Retrofit.Builder()
            .baseUrl(config.baseUrl)
            .client(client.build())
            .addConverterFactory(JacksonConverterFactory.create())
            .build()
    }

    @Provides
    fun ApiClient(retrofit: Retrofit): ApiClient = retrofit.create(ApiClient::class.java)

    @Provides
    fun FolderClient(retrofit: Retrofit): FolderClient = retrofit.create(FolderClient::class.java)
}
