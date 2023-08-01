package ploiu.fileserveruiandroid.model

import androidx.lifecycle.ViewModel
import com.fasterxml.jackson.annotation.JsonProperty
import dagger.hilt.android.lifecycle.HiltViewModel
import ploiu.fileserveruiandroid.client.FolderClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

data class FolderApi(
    @JsonProperty("id") val id: Long,
    @JsonProperty("parentId") val parentId: Long,
    @JsonProperty("path") val path: String,
    @JsonProperty("folders") val folders: List<FolderApi>,
    @JsonProperty("files") val files: List<FileApi>
)

@HiltViewModel
class FolderViewModel @Inject constructor(private val client: FolderClient) : ViewModel() {

    fun getFolder(id: Int, onSuccess: (FolderApi?) -> Unit) {
        client.getFolder(id).enqueue(object : Callback<FolderApi> {
            override fun onResponse(call: Call<FolderApi>, response: Response<FolderApi>) {
                if (response.isSuccessful) {
                    onSuccess.invoke(response.body())
                }
            }

            override fun onFailure(call: Call<FolderApi>, t: Throwable) {
                TODO("Not yet implemented")
            }
        })
    }
}
