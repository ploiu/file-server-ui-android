package ploiu.fileserveruiandroid.client

import ploiu.fileserveruiandroid.model.FolderApi
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.*

interface FolderClient {

    @GET("/folders/{id}")
    suspend fun getFolder(@Path("id") id: Int): Response<FolderApi>

    @DELETE("/folders/{id}")
    suspend fun deleteFolder(@Path("id") id: Int): Response<Void>

    @POST("/folders")
    suspend fun createFolder(@Body folder: FolderApi): Response<FolderApi>

    @PUT("/folders")
    suspend fun updateFolder(@Body folder: FolderApi): Response<FolderApi>
}
