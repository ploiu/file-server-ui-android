package ploiu.fileserveruiandroid.client

import ploiu.fileserveruiandroid.model.FolderApi
import retrofit2.Call
import retrofit2.http.*

interface FolderClient {

    @GET("/folders/{id}")
    fun getFolder(@Path("id") id: Int): Call<FolderApi>

    @DELETE("/folders/{id}")
    fun deleteFolder(@Path("id") id: Int): Call<Void>

    @POST("/folders")
    fun createFolder(@Body folder: FolderApi): Call<FolderApi>

    @PUT("/folders")
    fun updateFolder(@Body folder: FolderApi): Call<FolderApi>
}
