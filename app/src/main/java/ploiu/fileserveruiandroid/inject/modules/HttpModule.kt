package ploiu.fileserveruiandroid.inject.modules

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import ploiu.fileserveruiandroid.client.ApiClient
import retrofit2.Retrofit
import retrofit2.converter.jackson.JacksonConverterFactory

@Module
@InstallIn(SingletonComponent::class)
class HttpModule {
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://192.168.1.153:8000")
        .addConverterFactory(JacksonConverterFactory.create())
        .build();

    @Provides
    fun ApiClient(): ApiClient = retrofit.create(ApiClient::class.java)
}
