package ploiu.fileserveruiandroid.ui.folder

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
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
        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 30.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(folders) { folder -> Folder(folder) }
    }

}

@Composable
fun Folder(folder: FolderApi) {
    Card(modifier = Modifier
        .height(55.dp)
        .clickable { println("clicked!") }
        .fillMaxSize(),
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.primary)
    ) {
        Row {
            Image(painter = painterResource(id = R.drawable.folder), contentDescription = null)
            Text(text = folder.path)
        }
    }
}
