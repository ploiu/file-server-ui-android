package ploiu.fileserveruiandroid.client

import ploiu.fileserveruiandroid.model.Api
import retrofit2.Call
import retrofit2.http.GET

interface ApiClient {
    @GET("/api/version")
    fun getVersion(): Call<Api>
}
