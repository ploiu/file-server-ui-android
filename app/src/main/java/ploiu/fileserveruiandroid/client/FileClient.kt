package ploiu.fileserveruiandroid.client

import okhttp3.MultipartBody
import okhttp3.ResponseBody
import ploiu.fileserveruiandroid.model.FileApi
import ploiu.fileserveruiandroid.model.UpdateFileRequest
import retrofit2.Response
import retrofit2.http.*

interface FileClient {
    @Multipart
    @POST("/files")
    suspend fun uploadFile(
        @Part("file") file: MultipartBody.Part,
        @Part("extension") extension: MultipartBody.Part,
        @Part("folder_id") folderId: MultipartBody.Part
    ): Response<FileApi>

    @PUT("/files")
    suspend fun updateFileMetadata(@Body file: UpdateFileRequest): Response<FileApi>

    @GET("/files/metadata")
    suspend fun searchFiles(@Query("search") search: String): Response<List<FileApi>>

    @GET("/files/metadata/{id}")
    suspend fun getFileMetaData(@Path("id") fileId: Int): Response<FileApi>

    // https://stackoverflow.com/questions/32878478/how-to-download-file-in-android-using-retrofit-library
    @Streaming
    @GET("/files/{id}")
    suspend fun downloadFile(@Path("id") fileId: Int): Response<ResponseBody>

    @DELETE("/files/{id}")
    suspend fun deleteFile(@Path("id") fileId: Int): Response<Unit>


}
