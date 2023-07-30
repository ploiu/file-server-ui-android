package ploiu.fileserveruiandroid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import dagger.hilt.DefineComponent
import dagger.hilt.android.AndroidEntryPoint
import ploiu.fileserveruiandroid.client.ApiClient
import ploiu.fileserveruiandroid.ui.theme.FileServerUiAndroidTheme
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var apiClient: ApiClient
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        apiClient.getVersion().enqueue(object: Callback<String> {
            override fun onResponse(call: Call<String>, response: Response<String>) {
                println(response.body())
            }

            override fun onFailure(call: Call<String>, t: Throwable) {
                println(t.message)
            }
        })
        setContent {
            FileServerUiAndroidTheme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    Greeting("Android")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    FileServerUiAndroidTheme {
        Greeting("Android")
    }
}
