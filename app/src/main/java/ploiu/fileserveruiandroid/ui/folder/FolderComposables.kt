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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import ploiu.fileserveruiandroid.R
import ploiu.fileserveruiandroid.model.FolderApi
import ploiu.fileserveruiandroid.model.FolderViewModel

@Composable
fun FolderView(model: FolderViewModel = viewModel(), folderId: Int) {
    var folders: List<FolderApi> by remember { mutableStateOf(listOf()) }
    model.getFolder(folderId) {
        if (it != null) {
            folders = it.folders
        }
    }

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(vertical = 30.dp, horizontal = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(items = folders, key = FolderApi::id) { Folder(it) }
    }

}

@Composable
fun Folder(folder: FolderApi) {
    Card(modifier = Modifier
        .height(55.dp)
        .clickable { println("Clicked ${folder.id}") }
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
            Spacer(modifier = Modifier
                .weight(1f)
                .fillMaxHeight())
            // folder options menu
            IconButton(onClick = { println("Menu clicked for ${folder.id}") }) {
                Icon(imageVector = Icons.Filled.MoreVert, contentDescription = "Options")
            }
        }
    }
}
