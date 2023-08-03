package ploiu.fileserveruiandroid.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ploiu.fileserveruiandroid.client.FolderClient
import javax.inject.Inject

data class FolderApi(
    @JsonProperty("id") val id: Int,
    @JsonProperty("parentId") val parentId: Int,
    @JsonProperty("path") val path: String,
    @JsonProperty("folders") val folders: List<FolderApi>,
    @JsonProperty("files") val files: List<FileApi>
)

data class ContainingFolderViewState(val folder: FolderApi? = null, val errorMessage: String = "")

@HiltViewModel
class ContainingFolderViewModel @Inject constructor(private val client: FolderClient, private val mapper: ObjectMapper) :
    ViewModel() {
    private val _uiState = MutableStateFlow(ContainingFolderViewState())
    val uiState: StateFlow<ContainingFolderViewState> = _uiState.asStateFlow()

    fun setFolder(id: Int) {
        viewModelScope.launch {
            val res = client.getFolder(id)
            if (res.isSuccessful) {
                _uiState.value = ContainingFolderViewState(folder = res.body())
            } else {
                _uiState.value = ContainingFolderViewState(
                    errorMessage = mapper.readValue(
                        res.errorBody().toString(),
                        ErrorResponse::class.java
                    ).message
                )
            }
        }
    }
}
