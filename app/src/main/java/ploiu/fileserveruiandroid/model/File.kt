package ploiu.fileserveruiandroid.model

import com.fasterxml.jackson.annotation.JsonProperty

data class FileApi(@JsonProperty("id") val id: Long, @JsonProperty("name") val name: String)
