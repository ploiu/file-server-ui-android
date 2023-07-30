package ploiu.fileserveruiandroid.client

import retrofit2.Call
import retrofit2.http.GET
import javax.inject.Inject

interface ApiClient {
   @GET("/api/version")
   fun getVersion(): Call<String>;
}
