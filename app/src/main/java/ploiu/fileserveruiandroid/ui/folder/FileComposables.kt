package ploiu.fileserveruiandroid.ui.folder

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ploiu.fileserveruiandroid.R
import ploiu.fileserveruiandroid.model.FileApi
import ploiu.fileserveruiandroid.model.FileViewModel

@Composable
fun File(model: FileViewModel = hiltViewModel(), file: FileApi, onFileClicked: (FileApi) -> Unit) {
    val state by model.uiState.collectAsState()
    model.setFile(file)
    val f = state.file
    if (f != null) {
        Card(
            modifier = Modifier
                .height(55.dp)
                .clickable { onFileClicked(f) },
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            ),
            border = BorderStroke(3.dp, MaterialTheme.colorScheme.primary)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxSize()
            ) {
                Image(
                    painter = painterResource(id = R.drawable.folder),
                    contentDescription = null,
                    Modifier.padding(horizontal = 5.dp)
                )
                Spacer(modifier = Modifier.width(5.dp))
                Text(
                    text = file.name,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.fillMaxWidth(0.75f)
                )
                Spacer(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                )
                // folder options menu
                IconButton(onClick = { println("Menu clicked for ${file.id}") }) {
                    Icon(
                        imageVector = Icons.Filled.MoreVert,
                        contentDescription = "Options",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}
