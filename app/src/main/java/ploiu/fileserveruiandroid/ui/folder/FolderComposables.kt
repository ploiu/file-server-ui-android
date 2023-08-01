package ploiu.fileserveruiandroid.ui.folder

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
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
import ploiu.fileserveruiandroid.model.FolderApi
import ploiu.fileserveruiandroid.model.FolderViewModel


@Composable
fun FolderView(model: FolderViewModel = hiltViewModel(), folderId: Int, onFolderClicked: (FolderApi) -> Unit) {
    val state by model.uiState.collectAsState()
    model.setFolder(folderId)

    if (state.folder != null) {
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(vertical = 30.dp, horizontal = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(items = state.folder!!.folders, key = FolderApi::id) { Folder(it, onFolderClicked) }
        }
    }

}

@Composable
fun Folder(folder: FolderApi, onFolderClicked: (FolderApi) -> Unit) {
    println("folder " + folder.id)
    Card(modifier = Modifier
        .height(55.dp)
        .clickable { onFolderClicked(folder) }
        .fillMaxSize()
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Image(
                painter = painterResource(id = R.drawable.folder),
                contentDescription = null,
                Modifier.padding(horizontal = 5.dp)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = folder.path,
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
            IconButton(onClick = { println("Menu clicked for ${folder.id}") }) {
                Icon(imageVector = Icons.Filled.MoreVert, contentDescription = "Options")
            }
        }
    }
}
