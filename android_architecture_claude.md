# HackSense - Android Native Architecture Document

## Executive Summary

**Difficulty Assessment: MEDIUM**

Converting this web app to Android native is **moderately straightforward** because:
- ✅ Simple business logic with clear rules
- ✅ Straightforward data model (2 tables)
- ✅ No complex state management
- ✅ Standard CRUD operations
- ⚠️ Requires understanding of Android architecture patterns
- ⚠️ Image handling and compression needs proper implementation
- ⚠️ Network calls must handle Android lifecycle

**Estimated Effort**: 3-5 days for an experienced Android developer

---

## 1. Business Logic Documentation

### 1.1 Core Game Concept
**"AI vs Human Image Game"** - Players identify which of two images was created by a human rather than AI.

### 1.2 Business Rules

#### Game Flow Rules
1. **Game Initialization**
   - Load total number of available image pairs
   - Set max questions = number of pairs
   - Initialize score = 0, round = 1
   - Initialize empty list of used pair IDs

2. **Round Execution**
   - Fetch a random image pair (excluding already used pairs)
   - Shuffle the pair order (randomize which side shows which image)
   - Display both images with "Click if Human" instruction
   - User clicks one image
   - Check answer: correct if selected image has type = 'human'
   - Award 10 points for correct answer, 0 for wrong
   - Show feedback for 2.5 seconds with confetti on success
   - If round < maxQuestions: increment round, load next pair
   - If round >= maxQuestions: end game

3. **Pair Selection Logic**
   - Only select pairs that have BOTH one AI and one Human image
   - Track used pair_ids during game session
   - Don't repeat pairs in the same game
   - If all pairs used, reset and allow reuse
   - If no pairs available: show error message

4. **Scoring Rules**
   - Correct answer: +10 points
   - Wrong answer: +0 points
   - Score persists through entire game session
   - Score resets only when game restarts

5. **Game End Conditions**
   - Completed all rounds (round >= maxQuestions)
   - User manually resets the game
   - When game ends with score > 0: prompt for name

6. **Leaderboard Rules**
   - Store top rankings with name + score + date
   - Display top 10 rankings
   - Rankings persist across sessions
   - Sort by score descending

#### Data Validation Rules
1. **Image Upload (Admin)**
   - Must upload pairs (1 AI + 1 Human at same time)
   - Both images required
   - Compress to max 1200x1200px
   - Convert to JPEG quality 80
   - Assign same pair_id to both images
   - Generate unique ID for each image

2. **Score Submission**
   - Name required, max 50 characters
   - Name trimmed of whitespace
   - Score must be a positive number
   - Date auto-generated (YYYY-MM-DD)

3. **Image Check**
   - Selected image ID must exist in database
   - Return correct/incorrect based on type field
   - type = 'human' → correct
   - type = 'ai' → incorrect

---

## 2. Data Model

### 2.1 Database Schema

#### Table: `images`
```sql
CREATE TABLE images (
    id TEXT PRIMARY KEY,           -- Unique identifier (timestamp + random)
    file TEXT NOT NULL,            -- Storage path (e.g., "ai/123456-789.jpg")
    url TEXT NOT NULL,             -- Full public URL
    type TEXT NOT NULL,            -- 'ai' or 'human'
    pair_id INTEGER NOT NULL,      -- Groups AI+Human pairs together
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_images_pair_id ON images(pair_id);
CREATE INDEX idx_images_type ON images(type);
```

#### Table: `rankings`
```sql
CREATE TABLE rankings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,            -- Player name (max 50 chars)
    score INTEGER NOT NULL,        -- Total points earned
    date TEXT NOT NULL,            -- Game date (YYYY-MM-DD)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rankings_score ON rankings(score DESC);
CREATE INDEX idx_rankings_date ON rankings(date);
```

### 2.2 Data Transfer Objects (DTOs)

```kotlin
// Domain Models
data class ImageEntity(
    val id: String,
    val file: String,
    val url: String,
    val type: ImageType,
    val pairId: Int,
    val createdAt: String
)

enum class ImageType {
    AI, HUMAN
}

data class RankingEntity(
    val id: Int,
    val name: String,
    val score: Int,
    val date: String,
    val createdAt: String
)

// API Response Models
data class ImagePairResponse(
    val imageA: ImageInfo,
    val imageB: ImageInfo,
    val pairId: Int
)

data class ImageInfo(
    val id: String,
    val url: String
)

data class CheckAnswerResponse(
    val correct: Boolean,
    val points: Int,
    val type: String
)

data class RankingResponse(
    val name: String,
    val score: Int
)
```

---

## 3. Android Architecture Design

### 3.1 Architecture Pattern: **MVVM + Clean Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Activity   │  │   Fragment   │  │  Composables │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────▼──────────────────▼──────────────────▼──────┐  │
│  │              ViewModel (StateFlow)                │  │
│  └──────────────────────────┬────────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────┐
│                     DOMAIN LAYER                        │
│  ┌─────────────────┐      ┌──────────────────────────┐ │
│  │   Use Cases     │      │   Domain Models          │ │
│  │  (Interactors)  │      │   Business Rules         │ │
│  └────────┬────────┘      └──────────────────────────┘ │
└───────────┼─────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  ┌──────────────┐      ┌────────────────────────────┐  │
│  │ Repositories │      │    Data Sources            │  │
│  │              │◄─────┤  - Remote (Retrofit)       │  │
│  │              │      │  - Local (Room Cache)      │  │
│  └──────────────┘      └────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Module Structure

```
app/
├── data/
│   ├── remote/
│   │   ├── api/
│   │   │   ├── GameApiService.kt           // Retrofit API interface
│   │   │   └── AdminApiService.kt
│   │   ├── dto/                            // API response models
│   │   │   ├── ImagePairDto.kt
│   │   │   ├── CheckAnswerDto.kt
│   │   │   └── RankingDto.kt
│   │   └── interceptor/
│   │       └── AuthInterceptor.kt          // Supabase auth headers
│   ├── local/
│   │   ├── dao/
│   │   │   ├── ImageDao.kt
│   │   │   └── RankingDao.kt
│   │   ├── entity/                         // Room entities
│   │   │   ├── ImageEntity.kt
│   │   │   └── RankingEntity.kt
│   │   └── database/
│   │       └── AppDatabase.kt
│   ├── repository/
│   │   ├── GameRepositoryImpl.kt           // Repository implementations
│   │   ├── RankingRepositoryImpl.kt
│   │   └── AdminRepositoryImpl.kt
│   └── mapper/
│       ├── ImageMapper.kt                   // DTO ↔ Entity mappers
│       └── RankingMapper.kt
│
├── domain/
│   ├── model/
│   │   ├── ImagePair.kt                    // Domain models
│   │   ├── Image.kt
│   │   ├── Ranking.kt
│   │   └── GameState.kt
│   ├── repository/
│   │   ├── GameRepository.kt               // Repository interfaces
│   │   ├── RankingRepository.kt
│   │   └── AdminRepository.kt
│   └── usecase/
│       ├── LoadImagePairUseCase.kt         // Business logic
│       ├── CheckAnswerUseCase.kt
│       ├── SubmitScoreUseCase.kt
│       ├── GetRankingsUseCase.kt
│       ├── ResetGameUseCase.kt
│       └── admin/
│           └── UploadImagePairUseCase.kt
│
└── presentation/
    ├── game/
    │   ├── GameViewModel.kt                // State management
    │   ├── GameScreen.kt                   // Jetpack Compose UI
    │   ├── components/
    │   │   ├── ImageCard.kt
    │   │   ├── ScoreDisplay.kt
    │   │   ├── FeedbackOverlay.kt
    │   │   └── NameInputDialog.kt
    │   └── GameUiState.kt                  // UI state models
    ├── leaderboard/
    │   ├── LeaderboardViewModel.kt
    │   ├── LeaderboardScreen.kt
    │   └── LeaderboardUiState.kt
    ├── admin/
    │   ├── AdminViewModel.kt
    │   ├── AdminScreen.kt
    │   └── AdminUiState.kt
    ├── navigation/
    │   └── NavGraph.kt
    └── theme/
        ├── Color.kt                        // HackTudo colors
        ├── Theme.kt
        └── Type.kt
```

---

## 4. Detailed Component Design

### 4.1 Data Layer

#### GameRepository Interface
```kotlin
interface GameRepository {
    suspend fun getImagePair(usedPairIds: List<Int>): Result<ImagePair>
    suspend fun checkAnswer(selectedId: String): Result<CheckAnswerResponse>
    suspend fun getPairCount(): Result<Int>
    suspend fun cacheImages(images: List<Image>)
}
```

#### GameRepositoryImpl
```kotlin
class GameRepositoryImpl @Inject constructor(
    private val apiService: GameApiService,
    private val imageDao: ImageDao,
    private val imageMapper: ImageMapper,
    private val networkMonitor: NetworkMonitor
) : GameRepository {

    override suspend fun getImagePair(usedPairIds: List<Int>): Result<ImagePair> {
        return withContext(Dispatchers.IO) {
            try {
                // Try remote first
                if (networkMonitor.isConnected()) {
                    val response = apiService.getPair(usedPairIds.joinToString(","))
                    val pair = imageMapper.toDomain(response)

                    // Cache for offline
                    cacheImages(listOf(pair.imageA, pair.imageB))

                    Result.success(pair)
                } else {
                    // Fallback to cache
                    loadFromCache(usedPairIds)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    private suspend fun loadFromCache(usedPairIds: List<Int>): Result<ImagePair> {
        val cachedImages = imageDao.getAllImages()
        // Group by pair_id, filter used, shuffle
        // ... implementation
    }
}
```

---

### 4.2 Domain Layer

#### LoadImagePairUseCase
```kotlin
class LoadImagePairUseCase @Inject constructor(
    private val gameRepository: GameRepository
) {
    suspend operator fun invoke(usedPairIds: List<Int>): Result<ImagePair> {
        // Business logic: ensure pair has both AI and Human
        val result = gameRepository.getImagePair(usedPairIds)

        return result.mapCatching { pair ->
            require(pair.imageA.id.isNotEmpty()) { "Invalid image A" }
            require(pair.imageB.id.isNotEmpty()) { "Invalid image B" }
            require(pair.pairId > 0) { "Invalid pair ID" }
            pair
        }
    }
}
```

#### CheckAnswerUseCase
```kotlin
class CheckAnswerUseCase @Inject constructor(
    private val gameRepository: GameRepository
) {
    suspend operator fun invoke(selectedId: String): Result<CheckAnswerResponse> {
        require(selectedId.isNotEmpty()) { "Selected ID cannot be empty" }

        return gameRepository.checkAnswer(selectedId).mapCatching { response ->
            val points = if (response.correct) 10 else 0
            response.copy(points = points)
        }
    }
}
```

---

### 4.3 Presentation Layer

#### GameViewModel
```kotlin
@HiltViewModel
class GameViewModel @Inject constructor(
    private val loadImagePairUseCase: LoadImagePairUseCase,
    private val checkAnswerUseCase: CheckAnswerUseCase,
    private val submitScoreUseCase: SubmitScoreUseCase,
    private val getRankingsUseCase: GetRankingsUseCase,
    private val resetGameUseCase: ResetGameUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(GameUiState())
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()

    init {
        loadPairCount()
        loadImagePair()
        loadRankings()
    }

    fun onImageSelected(imageId: String) {
        if (_uiState.value.isAnimating || _uiState.value.isLoading) return

        viewModelScope.launch {
            _uiState.update { it.copy(isAnimating = true) }

            checkAnswerUseCase(imageId)
                .onSuccess { response ->
                    val newScore = _uiState.value.score + response.points

                    _uiState.update {
                        it.copy(
                            feedback = if (response.correct) "Acertou! 🎉" else "Errou! 😢",
                            score = newScore,
                            showConfetti = response.correct
                        )
                    }

                    // Wait for animation (2.5s)
                    delay(2500)

                    _uiState.update { it.copy(feedback = null, isAnimating = false) }

                    if (_uiState.value.round >= _uiState.value.maxQuestions) {
                        endGame()
                    } else {
                        nextRound()
                    }
                }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(
                            error = error.message,
                            isAnimating = false
                        )
                    }
                }
        }
    }

    private suspend fun nextRound() {
        _uiState.update {
            it.copy(round = it.round + 1)
        }
        loadImagePair()
    }

    private fun endGame() {
        _uiState.update {
            it.copy(
                gameOver = true,
                showNameDialog = it.score > 0
            )
        }
    }

    fun submitScore(name: String) {
        viewModelScope.launch {
            submitScoreUseCase(name, _uiState.value.score)
                .onSuccess {
                    loadRankings()
                    resetGame()
                }
                .onFailure { error ->
                    _uiState.update { it.copy(error = error.message) }
                }
        }
    }

    // ... other methods
}
```

#### GameUiState
```kotlin
data class GameUiState(
    val currentPair: ImagePair? = null,
    val score: Int = 0,
    val round: Int = 1,
    val maxQuestions: Int = 10,
    val feedback: String? = null,
    val isAnimating: Boolean = false,
    val isLoading: Boolean = false,
    val gameOver: Boolean = false,
    val showNameDialog: Boolean = false,
    val showConfetti: Boolean = false,
    val rankings: List<Ranking> = emptyList(),
    val usedPairIds: List<Int> = emptyList(),
    val error: String? = null,
    val fullscreenImage: String? = null
)
```

#### GameScreen (Jetpack Compose)
```kotlin
@Composable
fun GameScreen(
    viewModel: GameViewModel = hiltViewModel(),
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF1a0d29), // Dark purple
                        Color(0xFF4a1b6f), // Purple
                        Color(0xFFed752f)  // Orange
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Logo
            HackTudoLogo()

            // Score Display
            ScoreDisplay(
                score = uiState.score,
                round = uiState.round,
                maxRound = uiState.maxQuestions
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Game Area
            when {
                uiState.isLoading -> LoadingIndicator()
                uiState.gameOver -> GameOverCard(
                    score = uiState.score,
                    maxQuestions = uiState.maxQuestions,
                    onPlayAgain = viewModel::resetGame
                )
                uiState.currentPair != null -> ImagePairDisplay(
                    pair = uiState.currentPair!!,
                    isAnimating = uiState.isAnimating,
                    onImageClick = viewModel::onImageSelected,
                    onFullscreenClick = viewModel::showFullscreen
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Leaderboard
            LeaderboardCard(rankings = uiState.rankings)

            Spacer(modifier = Modifier.height(16.dp))

            // Reset Button
            ResetButton(onClick = viewModel::handleReset)
        }

        // Feedback Overlay
        uiState.feedback?.let { feedback ->
            FeedbackOverlay(
                message = feedback,
                isSuccess = feedback.contains("Acertou")
            )
        }

        // Confetti Effect
        if (uiState.showConfetti) {
            ConfettiEffect(onComplete = viewModel::hideConfetti)
        }

        // Name Input Dialog
        if (uiState.showNameDialog) {
            NameInputDialog(
                score = uiState.score,
                onSubmit = viewModel::submitScore,
                onDismiss = viewModel::resetGame
            )
        }

        // Fullscreen Image
        uiState.fullscreenImage?.let { imageUrl ->
            FullscreenImageDialog(
                imageUrl = imageUrl,
                onDismiss = viewModel::hideFullscreen
            )
        }

        // Error Snackbar
        uiState.error?.let { error ->
            ErrorSnackbar(
                message = error,
                onDismiss = viewModel::clearError
            )
        }
    }
}
```

---

## 5. Technology Stack

### 5.1 Core Dependencies

```kotlin
// build.gradle.kts (app)

dependencies {
    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.20")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Android Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")

    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.navigation:navigation-compose:2.7.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Dependency Injection - Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // Networking - Retrofit + OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Local Database - Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Image Loading - Coil
    implementation("io.coil-kt:coil-compose:2.5.0")

    // Image Compression
    implementation("id.zelory:compressor:3.0.1")

    // Confetti Animation
    implementation("nl.dionsegijn:konfetti-compose:2.0.3")

    // Splash Screen
    implementation("androidx.core:core-splashscreen:1.0.1")

    // Supabase (optional - can use Retrofit directly)
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:storage-kt:2.0.0")
    implementation("io.ktor:ktor-client-android:2.3.7")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("app.cash.turbine:turbine:1.0.0")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
```

### 5.2 Network Configuration

#### Retrofit Setup
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "https://your-vercel-app.vercel.app/"
    private const val SUPABASE_URL = "https://afmsegsxgvsqwdctasyl.supabase.co/"
    private const val SUPABASE_KEY = "your-supabase-anon-key"

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("apikey", SUPABASE_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_KEY")
                    .build()
                chain.proceed(request)
            }
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideGameApiService(retrofit: Retrofit): GameApiService {
        return retrofit.create(GameApiService::class.java)
    }
}
```

#### API Service Interface
```kotlin
interface GameApiService {
    @GET("api/pair")
    suspend fun getPair(@Query("used") usedPairIds: String = ""): ImagePairResponse

    @POST("api/check")
    suspend fun checkAnswer(@Body request: CheckAnswerRequest): CheckAnswerResponse

    @GET("api/rankings")
    suspend fun getRankings(): List<RankingResponse>

    @POST("api/score")
    suspend fun submitScore(@Body request: SubmitScoreRequest): SuccessResponse

    @GET("api/admin/pairs")
    suspend fun getPairs(): List<PairResponse>
}
```

---

## 6. Error Handling Strategy

### 6.1 Error Types
```kotlin
sealed class AppError : Exception() {
    data class NetworkError(override val message: String) : AppError()
    data class ApiError(val code: Int, override val message: String) : AppError()
    data class ValidationError(override val message: String) : AppError()
    data class CacheError(override val message: String) : AppError()
    object NoInternetError : AppError() {
        override val message = "Sem conexão com internet"
    }
}
```

### 6.2 Global Error Handler
```kotlin
class ErrorHandler @Inject constructor() {
    fun handle(error: Throwable): String {
        return when (error) {
            is AppError.NetworkError -> "Erro de rede: ${error.message}"
            is AppError.ApiError -> "Erro do servidor: ${error.message}"
            is AppError.ValidationError -> error.message
            is AppError.NoInternetError -> error.message
            is SocketTimeoutException -> "Tempo esgotado. Tente novamente."
            is UnknownHostException -> "Servidor não encontrado"
            else -> "Erro desconhecido: ${error.message}"
        }
    }
}
```

### 6.3 Retry Strategy
```kotlin
suspend fun <T> retryWithExponentialBackoff(
    times: Int = 3,
    initialDelay: Long = 100,
    maxDelay: Long = 1000,
    factor: Double = 2.0,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(times - 1) {
        try {
            return block()
        } catch (e: Exception) {
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelay)
        }
    }
    return block() // Last attempt
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

#### ViewModel Test
```kotlin
@ExperimentalCoroutinesTest
class GameViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var viewModel: GameViewModel
    private val loadImagePairUseCase: LoadImagePairUseCase = mockk()
    private val checkAnswerUseCase: CheckAnswerUseCase = mockk()

    @Before
    fun setup() {
        viewModel = GameViewModel(
            loadImagePairUseCase,
            checkAnswerUseCase,
            // ... other mocked use cases
        )
    }

    @Test
    fun `onImageSelected with correct answer increases score by 10`() = runTest {
        // Given
        val mockResponse = CheckAnswerResponse(correct = true, points = 10, type = "human")
        coEvery { checkAnswerUseCase("image123") } returns Result.success(mockResponse)

        // When
        viewModel.onImageSelected("image123")
        advanceUntilIdle()

        // Then
        assertEquals(10, viewModel.uiState.value.score)
        assertTrue(viewModel.uiState.value.showConfetti)
    }

    @Test
    fun `game ends after max questions reached`() = runTest {
        // Given
        val initialState = viewModel.uiState.value.copy(
            round = 10,
            maxQuestions = 10
        )

        // When
        // ... simulate answer

        // Then
        assertTrue(viewModel.uiState.value.gameOver)
    }
}
```

### 7.2 Repository Tests
```kotlin
class GameRepositoryImplTest {

    private lateinit var repository: GameRepositoryImpl
    private val apiService: GameApiService = mockk()
    private val imageDao: ImageDao = mockk()

    @Test
    fun `getImagePair returns success when API call succeeds`() = runTest {
        // Given
        val mockResponse = ImagePairResponse(/* ... */)
        coEvery { apiService.getPair(any()) } returns mockResponse

        // When
        val result = repository.getImagePair(emptyList())

        // Then
        assertTrue(result.isSuccess)
    }
}
```

---

## 8. Performance Optimizations

### 8.1 Image Loading
```kotlin
@Composable
fun OptimizedImageCard(
    imageUrl: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(imageUrl)
            .crossfade(true)
            .memoryCacheKey(imageUrl)
            .diskCacheKey(imageUrl)
            .memoryCachePolicy(CachePolicy.ENABLED)
            .diskCachePolicy(CachePolicy.ENABLED)
            .size(Size.ORIGINAL) // Load at original size
            .build(),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = modifier.clickable { onClick() }
    )
}
```

### 8.2 State Management Optimization
```kotlin
// Use derivedStateOf for computed values
val filteredRankings by remember {
    derivedStateOf {
        uiState.rankings.take(10)
    }
}

// Use remember for expensive calculations
val pairCount = remember(images) {
    images.groupBy { it.pairId }.count { it.value.size == 2 }
}
```

### 8.3 Database Optimization
```kotlin
@Dao
interface ImageDao {
    @Query("SELECT * FROM images WHERE pair_id NOT IN (:usedPairIds) ORDER BY RANDOM() LIMIT 2")
    suspend fun getRandomUnusedPair(usedPairIds: List<Int>): List<ImageEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun cacheImages(images: List<ImageEntity>)

    @Query("DELETE FROM images WHERE created_at < :threshold")
    suspend fun cleanOldCache(threshold: Long)
}
```

---

## 9. Security Considerations

### 9.1 API Key Storage
```kotlin
// Use BuildConfig or local.properties
object ApiConfig {
    const val SUPABASE_URL = BuildConfig.SUPABASE_URL
    const val SUPABASE_KEY = BuildConfig.SUPABASE_KEY
}

// In build.gradle.kts
android {
    buildTypes {
        release {
            buildConfigField("String", "SUPABASE_URL", "\"${project.findProperty("SUPABASE_URL")}\"")
            buildConfigField("String", "SUPABASE_KEY", "\"${project.findProperty("SUPABASE_KEY")}\"")
        }
    }
}
```

### 9.2 Input Validation
```kotlin
fun validatePlayerName(name: String): Result<String> {
    return when {
        name.isBlank() -> Result.failure(ValidationError("Nome não pode ser vazio"))
        name.length > 50 -> Result.failure(ValidationError("Nome muito longo"))
        name.contains(Regex("[<>]")) -> Result.failure(ValidationError("Caracteres inválidos"))
        else -> Result.success(name.trim())
    }
}
```

### 9.3 Certificate Pinning (Optional)
```kotlin
val certificatePinner = CertificatePinner.Builder()
    .add("afmsegsxgvsqwdctasyl.supabase.co", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .build()

val okHttpClient = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()
```

---

## 10. Deployment Checklist

### 10.1 Pre-Release
- [ ] Enable ProGuard/R8 for code obfuscation
- [ ] Remove all logging in release builds
- [ ] Test on multiple devices (min API 24, target API 34)
- [ ] Test with slow network conditions
- [ ] Test offline functionality
- [ ] Verify image compression quality
- [ ] Check memory leaks (LeakCanary)
- [ ] Run UI tests
- [ ] Verify analytics integration

### 10.2 Build Configuration
```kotlin
// build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    bundle {
        language {
            enableSplit = false // Include all languages
        }
    }
}
```

---

## 11. Migration Path from Web

### 11.1 Phase 1: Core Game (Week 1)
1. Setup project structure with Clean Architecture
2. Implement data layer (Retrofit + Room)
3. Create domain layer (use cases + repositories)
4. Build game screen UI with Jetpack Compose
5. Implement game logic in ViewModel
6. Test core game flow

### 11.2 Phase 2: Features (Week 2)
1. Add leaderboard functionality
2. Implement confetti animations
3. Add fullscreen image viewer
4. Implement offline caching
5. Add error handling and retry logic
6. Polish UI/UX with HackTudo branding

### 11.3 Phase 3: Admin & Polish (Week 3)
1. Create admin panel for image uploads
2. Implement image compression
3. Add analytics
4. Performance optimization
5. Security hardening
6. Testing and bug fixes

---

## 12. Potential Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Image Loading Performance** | Use Coil with aggressive caching, preload next image |
| **Memory Issues with Large Images** | Compress images, use subsampling |
| **Network Timeouts** | Implement retry logic, cache locally |
| **State Management Complexity** | Use single source of truth (StateFlow), immutable states |
| **Testing ViewModels with Coroutines** | Use `TestCoroutineDispatcher`, `runTest` |
| **Animations Performance** | Use hardware acceleration, limit particle count |
| **Admin Upload UI** | Use `ActivityResultContract` for image picking |
| **Offline Support** | Implement Room cache with sync strategy |

---

## 13. Future Enhancements

### 13.1 Advanced Features
- **Multi-language support** (i18n)
- **Dark/Light theme toggle**
- **Social sharing** (share score to social media)
- **Difficulty levels** (easy/medium/hard based on image complexity)
- **Achievements system** (badges for milestones)
- **Daily challenges** (new sets every day)
- **Multiplayer mode** (real-time competition)
- **Image zoom** (pinch to zoom in fullscreen)
- **Tutorial/Onboarding** (first-time user guide)
- **Analytics dashboard** (admin view of user stats)

### 13.2 Technical Improvements
- **Jetpack Compose Material3 full migration**
- **WorkManager for background sync**
- **Firebase Remote Config** for dynamic settings
- **Crashlytics integration**
- **Performance monitoring** (Firebase Performance)
- **A/B testing** for UI variations
- **Modularization** (separate feature modules)

---

## 14. Conclusion

### Summary
Porting this web app to Android native is **moderately straightforward** with an estimated **3-5 days** effort for an experienced Android developer. The business logic is simple and well-defined, making it easy to replicate.

### Key Takeaways
1. **Use MVVM + Clean Architecture** for maintainability and testability
2. **Jetpack Compose** for modern, declarative UI
3. **Hilt** for dependency injection
4. **Retrofit + Room** for network + local storage
5. **StateFlow** for reactive state management
6. **Coil** for efficient image loading
7. **Konfetti** for confetti animations

### Success Metrics
- **Zero crashes** in production
- **< 2s** image load time on 4G
- **< 100MB** APK size
- **> 60 FPS** smooth animations
- **100%** test coverage for business logic

---

## Appendix A: HackTudo Brand Colors

```kotlin
// Color.kt
val HackTudoDarkPurple = Color(0xFF1a0d29)
val HackTudoPurple = Color(0xFF4a1b6f)
val HackTudoOrange = Color(0xFFed752f)
val HackTudoYellow = Color(0xFFf9bb37)
val HackTudoGreen = Color(0xFF5dbf4a)
val HackTudoRed = Color(0xFFd94141)
val HackTudoWhite = Color(0xFFefefef)
```

---

## Appendix B: API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pair?used={ids}` | GET | Get random image pair (excluding used) |
| `/api/check` | POST | Check if selected image is human |
| `/api/rankings` | GET | Get top 10 rankings |
| `/api/score` | POST | Submit player score |
| `/api/admin/pairs` | GET | Get all pairs (admin) |
| `/api/admin/upload/pair` | POST | Upload new image pair (admin) |
| `/api/admin/image/{id}` | DELETE | Delete image by ID (admin) |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-03
**Author**: Claude Code Assistant
**Target Audience**: Android Developers
