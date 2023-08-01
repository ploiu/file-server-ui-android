package ploiu.fileserveruiandroid.inject.modules

import com.fasterxml.jackson.databind.ObjectMapper
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
class JacksonModule {

    @Provides
    fun objectMapper() = ObjectMapper()

}
