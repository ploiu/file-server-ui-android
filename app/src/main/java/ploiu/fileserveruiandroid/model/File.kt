package ploiu.fileserveruiandroid.model

import androidx.lifecycle.ViewModel
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import ploiu.fileserveruiandroid.client.FileClient
import javax.inject.Inject

data class FileApi(@JsonProperty("id") val id: Int, @JsonProperty("name") val name: String)

data class UpdateFileRequest(
    @JsonProperty("id") val id: Int,
    @JsonProperty("name") val name: String,
    @JsonProperty("folderId") val folderId: Int
)

data class FileViewState(val file: FileApi? = null, val errorMessage: String? = null)

@HiltViewModel
@Suppress("unused")
class FileViewModel @Inject constructor(private val client: FileClient, private val mapper: ObjectMapper) :
    ViewModel() {
    private val _uiState = MutableStateFlow(FileViewState())
    val uiState: StateFlow<FileViewState> = _uiState.asStateFlow()

    fun setFile(file: FileApi) {
        _uiState.value = FileViewState(file)
    }
}
