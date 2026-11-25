export type Block =
  | { type: "text"; text: string }
  | { type: "formula"; tex: string }
  | { type: "code"; code: string }
  | { type: "points"; title?: string; items: string[] }
  | { type: "table"; title?: string; headers: [string, string]; rows: [string, string][] }
  | { type: "sample"; title: string; text: string };

export type Program = {
  name: string;
  blocks: Block[];
};

export type Practical = {
  number: string;
  title: string;
  summary: string;
  programs: Program[];
  after?: Block[];
};

function code(source: string): Block {
  return { type: "code", code: source.replace(/^\n/, "").replace(/\n$/, "") };
}

function text(source: string): Block {
  return { type: "text", text: source.trim() };
}

function formula(tex: string): Block {
  return { type: "formula", tex };
}

export const practicals: Practical[] = [
  {
    number: "01",
    title: "Linear Algebra",
    summary: "Matrix operations, Gaussian elimination, eigenvalues, and diagonalization.",
    programs: [
      {
        name: "Matrix Addition",
        blocks: [
          code(String.raw`n = int(input("Enter matrix size: "))

A = []
B = []

print("Enter Matrix A:")
for i in range(n):
    A.append(list(map(int, input().split())))

print("Enter Matrix B:")
for i in range(n):
    B.append(list(map(int, input().split())))

C = []

for i in range(n):
    row = []
    for j in range(n):
        row.append(A[i][j] + B[i][j])
    C.append(row)

print("Addition:")
for row in C:
    print(row)`),
        ],
      },
      {
        name: "Matrix Subtraction",
        blocks: [
          code(String.raw`n = int(input("Enter matrix size: "))

A = []
B = []

print("Enter Matrix A:")
for i in range(n):
    A.append(list(map(int, input().split())))

print("Enter Matrix B:")
for i in range(n):
    B.append(list(map(int, input().split())))

C = []

for i in range(n):
    row = []
    for j in range(n):
        row.append(A[i][j] - B[i][j])
    C.append(row)

print("Subtraction:")
for row in C:
    print(row)`),
        ],
      },
      {
        name: "Matrix Multiplication",
        blocks: [
          code(String.raw`n = int(input("Enter matrix size: "))

A = []
B = []

print("Enter Matrix A:")
for i in range(n):
    A.append(list(map(int, input().split())))

print("Enter Matrix B:")
for i in range(n):
    B.append(list(map(int, input().split())))

C = [[0 for j in range(n)] for i in range(n)]

for i in range(n):
    for j in range(n):
        for k in range(n):
            C[i][j] += A[i][k] * B[k][j]

print("Multiplication:")
for row in C:
    print(row)`),
        ],
      },
      {
        name: "Scalar Multiplication",
        blocks: [
          code(String.raw`n = int(input("Enter matrix size: "))

A = []

print("Enter Matrix:")
for i in range(n):
    A.append(list(map(int, input().split())))

k = int(input("Enter scalar: "))

C = []

for i in range(n):
    row = []
    for j in range(n):
        row.append(k * A[i][j])
    C.append(row)

print("Scalar Multiplication:")
for row in C:
    print(row)`),
        ],
      },
      {
        name: "Transpose of Matrix",
        blocks: [
          code(String.raw`n = int(input("Enter matrix size: "))

A = []

print("Enter Matrix:")
for i in range(n):
    A.append(list(map(int, input().split())))

T = []

for j in range(n):
    row = []
    for i in range(n):
        row.append(A[i][j])
    T.append(row)

print("Transpose:")
for row in T:
    print(row)`),
        ],
      },
      {
        name: "Gaussian Elimination",
        blocks: [
          code(String.raw`import numpy as np

n = int(input("Enter number of variables: "))

A = []
b = []

print("Enter coefficient matrix:")
for i in range(n):
    A.append(list(map(float, input().split())))

print("Enter constants:")
for i in range(n):
    b.append(float(input()))

A = np.array(A)
b = np.array(b)

for i in range(n):
    for j in range(i+1, n):
        factor = A[j][i] / A[i][i]
        A[j] = A[j] - factor * A[i]
        b[j] = b[j] - factor * b[i]

x = np.zeros(n)

for i in range(n-1, -1, -1):
    x[i] = (b[i] - np.dot(A[i][i+1:], x[i+1:])) / A[i][i]

print("Solution:")
for i in range(n):
    print("x", i+1, "=", x[i])`),
          text("This basic version assumes nonzero pivots. For more robust solving, use partial pivoting."),
        ],
      },
      {
        name: "Eigenvalues and Eigenvectors",
        blocks: [
          code(String.raw`import numpy as np

n = int(input("Enter matrix size: "))

A = []

print("Enter Matrix:")
for i in range(n):
    A.append(list(map(float, input().split())))

A = np.array(A)

values, vectors = np.linalg.eig(A)

print("Eigenvalues:")
print(values)

print("Eigenvectors:")
print(vectors)`),
        ],
      },
      {
        name: "Matrix Diagonalization",
        blocks: [
          code(String.raw`import numpy as np

n = int(input("Enter matrix size: "))

A = []

print("Enter Matrix:")
for i in range(n):
    A.append(list(map(float, input().split())))

A = np.array(A)

values, vectors = np.linalg.eig(A)

D = np.diag(values)

print("Diagonal Matrix:")
print(D)

print("Eigenvector Matrix:")
print(vectors)

if np.linalg.matrix_rank(vectors) == n:
    print("Diagonalization Verified:")
    print(vectors @ D @ np.linalg.inv(vectors))
else:
    print("Matrix is not diagonalizable.")`),
        ],
      },
    ],
  },
  {
    number: "02",
    title: "Probability Distributions",
    summary:
      "Random variables, PMF, the binomial distribution, PDF, and the normal distribution. The supporting material also includes a joint PMF for two dice and the central limit theorem.",
    programs: [
      {
        name: "Binomial Distribution",
        blocks: [
          text("Formula:"),
          formula(String.raw`P(X=k)=\binom{n}{k}p^{k}(1-p)^{n-k}`),
          code(String.raw`import math
import numpy as np
import matplotlib.pyplot as plt

n = int(input("Enter number of trials: "))
p = float(input("Enter probability of success: "))

if n < 0 or p < 0 or p > 1:
    print("Invalid input")
else:
    x = np.arange(n + 1)
    probabilities = []

    for k in x:
        prob = (math.factorial(n) /
                (math.factorial(k) * math.factorial(n - k))) * \
                (p ** k) * ((1 - p) ** (n - k))
        probabilities.append(prob)

    print("X\tP(X)")
    for i in range(n + 1):
        print(x[i], "\t", round(probabilities[i], 4))

    plt.bar(x, probabilities)
    plt.xlabel("Number of successes")
    plt.ylabel("Probability")
    plt.title("Binomial Distribution")
    plt.show()`),
          {
            type: "points",
            title: "Remember",
            items: [
              "n = number of trials.",
              "p = probability of success.",
              "k = number of successes.",
              "math.factorial() calculates factorial.",
              "np.arange(n + 1) generates values from 0 to n.",
            ],
          },
        ],
      },
      {
        name: "Normal Distribution",
        blocks: [
          code(String.raw`import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm

mu = float(input("Enter mean: "))
sigma = float(input("Enter standard deviation: "))

if sigma <= 0:
    print("Standard deviation must be positive")
else:
    x = np.linspace(mu - 4 * sigma, mu + 4 * sigma, 1000)
    y = norm.pdf(x, mu, sigma)

    plt.plot(x, y)
    plt.title("Normal Distribution")
    plt.xlabel("Values")
    plt.ylabel("Probability Density")
    plt.grid()
    plt.show()`),
          text("norm.pdf(x, mu, sigma) calculates the probability density function."),
        ],
      },
      {
        name: "Probability Between Two Values in Normal Distribution",
        blocks: [
          code(String.raw`from scipy.stats import norm

mu = float(input("Enter mean: "))
sigma = float(input("Enter standard deviation: "))
a = float(input("Enter lower limit: "))
b = float(input("Enter upper limit: "))

if sigma <= 0 or a > b:
    print("Invalid input")
else:
    probability = norm.cdf(b, mu, sigma) - norm.cdf(a, mu, sigma)
    print("Probability =", round(probability, 4))`),
          text(
            "Viva point: norm.cdf() gives the cumulative probability up to a value. To calculate the probability between two values, subtract the two CDF values.",
          ),
          formula(String.raw`P(a<X<b)=F(b)-F(a)`),
        ],
      },
      {
        name: "Joint PMF of Two Dice",
        blocks: [
          text(
            "Each die has six outcomes, and every ordered pair has probability 1/36.",
          ),
          code(String.raw`import numpy as np
import matplotlib.pyplot as plt

outcomes = range(1, 7)
pmf = np.zeros((6, 6))

for i in range(6):
    for j in range(6):
        pmf[i][j] = 1 / 36

print("Joint PMF:")
print(pmf)
print("Total Probability:", np.sum(pmf))

plt.imshow(pmf)
plt.colorbar(label="Probability")
plt.xlabel("Die 2")
plt.ylabel("Die 1")
plt.title("Joint PMF of Two Dice")
plt.xticks(range(6), outcomes)
plt.yticks(range(6), outcomes)

for i in range(6):
    for j in range(6):
        plt.text(j, i, round(pmf[i][j], 3),
                 ha="center", va="center")

plt.show()`),
          text(
            "Viva: What is a joint PMF? It gives the probability that two discrete random variables take particular values at the same time.",
          ),
          formula(String.raw`P(X=x,Y=y)`),
        ],
      },
      {
        name: "Central Limit Theorem Simulation",
        blocks: [
          code(String.raw`import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm

population = np.random.uniform(0, 1, 100000)
sample_size = 50
num_samples = 1000
sample_means = []

for i in range(num_samples):
    sample = np.random.choice(
        population,
        size=sample_size,
        replace=True
    )
    sample_means.append(np.mean(sample))

mean = np.mean(sample_means)
std = np.std(sample_means)

plt.hist(sample_means, bins=30, density=True)

x = np.linspace(min(sample_means), max(sample_means), 1000)
y = norm.pdf(x, mean, std)

plt.plot(x, y)
plt.title("Central Limit Theorem")
plt.xlabel("Sample Means")
plt.ylabel("Density")
plt.show()

print("Mean of sample means:", mean)`),
          text(
            "The central limit theorem says that the distribution of sample means tends toward a normal distribution when sufficiently large samples are drawn repeatedly, under the usual assumptions.",
          ),
        ],
      },
    ],
  },
  {
    number: "03",
    title: "Hypothesis Testing",
    summary:
      "Large-sample test for a single mean, a small-sample t-test for the difference of means, a test for a single proportion, and an F-test for comparison of variances.",
    programs: [
      {
        name: "Z-Test for Single Mean",
        blocks: [
          code(String.raw`import numpy as np
from scipy.stats import norm

sample = list(map(float, input(
    "Enter sample values separated by spaces: ").split()))
mu = float(input("Enter population mean: "))
sigma = float(input("Enter population standard deviation: "))
alpha = 0.05

n = len(sample)

if n < 30 or sigma <= 0:
    print("Check sample size and standard deviation")
else:
    x_bar = np.mean(sample)
    z = (x_bar - mu) / (sigma / np.sqrt(n))
    p_value = 2 * norm.sf(abs(z))

    print("Sample Mean:", x_bar)
    print("Z Statistic:", z)
    print("P-value:", p_value)

    if p_value < alpha:
        print("Reject Null Hypothesis")
    else:
        print("Fail to Reject Null Hypothesis")`),
          text("Formula:"),
          formula(String.raw`Z=\dfrac{\bar{x}-\mu}{\sigma/\sqrt{n}}`),
        ],
      },
      {
        name: "Two-Sample t-Test",
        blocks: [
          text("This compares the means of two independent small samples."),
          code(String.raw`import numpy as np
from scipy.stats import ttest_ind

sample1 = list(map(float, input(
    "Enter first sample: ").split()))
sample2 = list(map(float, input(
    "Enter second sample: ").split()))
alpha = 0.05

if len(sample1) < 2 or len(sample2) < 2:
    print("Each sample must contain at least two values")
else:
    t_stat, p_value = ttest_ind(
        sample1,
        sample2,
        equal_var=True
    )

    print("T Statistic:", t_stat)
    print("P-value:", p_value)

    if p_value < alpha:
        print("Reject Null Hypothesis")
    else:
        print("Fail to Reject Null Hypothesis")`),
          text("Formula for the pooled two-sample t-test:"),
          formula(String.raw`t=\dfrac{\bar{x}_1-\bar{x}_2}{s_p\sqrt{\dfrac{1}{n_1}+\dfrac{1}{n_2}}}`),
          text("This program uses SciPy's independent t-test with equal variances assumed."),
        ],
      },
      {
        name: "Z-Test for Single Proportion",
        blocks: [
          code(String.raw`import math
from scipy.stats import norm

n = int(input("Enter sample size: "))
x = int(input("Enter number of successes: "))
p0 = float(input("Enter hypothesized proportion: "))
alpha = 0.05

if n <= 0 or x < 0 or x > n or not 0 < p0 < 1:
    print("Invalid input")
else:
    p_hat = x / n
    se = math.sqrt(p0 * (1 - p0) / n)
    z = (p_hat - p0) / se
    p_value = 2 * norm.sf(abs(z))

    print("Sample Proportion:", round(p_hat, 4))
    print("Z Statistic:", round(z, 4))
    print("P-value:", round(p_value, 4))

    if p_value < alpha:
        print("Reject Null Hypothesis")
    else:
        print("Fail to Reject Null Hypothesis")`),
          text("Formula:"),
          formula(String.raw`Z=\dfrac{\hat{p}-p_0}{\sqrt{\dfrac{p_0(1-p_0)}{n}}}`),
        ],
      },
      {
        name: "F-Test for Comparison of Variances",
        blocks: [
          code(String.raw`import numpy as np
from scipy.stats import f

sample1 = list(map(float, input(
    "Enter first sample: ").split()))
sample2 = list(map(float, input(
    "Enter second sample: ").split()))
alpha = 0.05

if len(sample1) < 2 or len(sample2) < 2:
    print("Each sample needs at least two values")
else:
    var1 = np.var(sample1, ddof=1)
    var2 = np.var(sample2, ddof=1)

    if var1 == 0 or var2 == 0:
        print("Variance cannot be zero for this test")
    else:
        F = var1 / var2
        df1 = len(sample1) - 1
        df2 = len(sample2) - 1
        cdf = f.cdf(F, df1, df2)
        p_value = 2 * min(cdf, 1 - cdf)

        print("Variance 1:", var1)
        print("Variance 2:", var2)
        print("F Statistic:", F)
        print("P-value:", p_value)`),
          text("Formula:"),
          formula(String.raw`F=\dfrac{s_1^2}{s_2^2}`),
          text(
            "The F-test assumes independent samples from normally distributed populations. ddof=1 calculates the sample variance with denominator n − 1.",
          ),
        ],
      },
    ],
    after: [
      {
        type: "table",
        title: "Hypothesis testing: must-know viva",
        headers: ["Term", "Meaning"],
        rows: [
          ["H₀", "Null hypothesis"],
          ["H₁", "Alternative hypothesis"],
          ["α", "Significance level"],
          ["p-value", "Probability measure used to assess evidence against H₀"],
          ["Z-test", "Commonly used for large samples or a known population standard deviation"],
          ["t-test", "Used for mean comparisons when the population standard deviation is unknown"],
          ["F-test", "Compares population variances"],
        ],
      },
      {
        type: "points",
        title: "At a 5% significance level",
        items: [
          "If the p-value is less than 0.05, reject H₀.",
          "If the p-value is greater than or equal to 0.05, fail to reject H₀.",
          "Do not say that you accept H₀. The correct phrase is “fail to reject H₀.”",
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Stochastic Processes and Markov Chains",
    summary:
      "First-order Markov simulation, n-step transition probabilities, the steady-state distribution, and a second-order Markov process.",
    programs: [
      {
        name: "First-Order Markov Process Simulation",
        blocks: [
          text(
            "A Markov process has this property: the next state depends only on the current state. This program uses the weather example, Sunny and Rainy.",
          ),
          code(String.raw`import numpy as np

states = ["Sunny", "Rainy"]
P = np.array([
    [0.8, 0.2],
    [0.4, 0.6]
])

steps = int(input("Enter number of steps: "))
current = 0
sequence = [states[current]]

for i in range(steps - 1):
    current = np.random.choice(
        [0, 1],
        p=P[current]
    )
    sequence.append(states[current])

print("Sequence:")
print(" -> ".join(sequence))

print("State Counts:")
for state in states:
    print(state, ":", sequence.count(state))`),
          text("This line selects the next state using the probabilities in the current state's row."),
          code(String.raw`current = np.random.choice([0, 1], p=P[current])`),
          text("If the current state is Sunny, the probabilities are [0.8, 0.2]."),
        ],
      },
      {
        name: "n-Step Transition Probability",
        blocks: [
          text("The formula is:"),
          formula(String.raw`P^{(n)}=P^{n}`),
          code(String.raw`import numpy as np

P = np.array([
    [0.8, 0.2],
    [0.4, 0.6]
])

n = int(input("Enter number of steps: "))

if n < 0:
    print("Invalid number of steps")
else:
    Pn = np.linalg.matrix_power(P, n)
    print("Transition Matrix:")
    print(np.round(Pn, 4))`),
          {
            type: "sample",
            title: "For two steps, the output is",
            text: `[[0.72 0.28]
 [0.56 0.44]]`,
          },
          text("np.linalg.matrix_power(P, n) raises the matrix to the power n."),
        ],
      },
      {
        name: "Steady-State Distribution",
        blocks: [
          text(
            "The steady-state distribution is the long-run probability of being in each state. It satisfies:",
          ),
          formula(String.raw`\pi P=\pi`),
          text("where π is the steady-state probability vector."),
          code(String.raw`import numpy as np

P = np.array([
    [0.8, 0.2],
    [0.4, 0.6]
])

n = len(P)
pi = np.ones(n) / n

for i in range(1000):
    pi_new = pi @ P
    if np.allclose(pi, pi_new):
        break
    pi = pi_new

print("Steady State Distribution:")
print(np.round(pi, 4))`),
          {
            type: "sample",
            title: "Expected result",
            text: "[0.6667 0.3333]",
          },
          text(
            "This matrix has a long-run probability of about 66.67% for Sunny and 33.33% for Rainy.",
          ),
          {
            type: "points",
            title: "Remember",
            items: [
              "@ performs matrix multiplication.",
              "np.ones(n) creates an array of ones.",
              "np.allclose() checks whether two arrays are approximately equal.",
            ],
          },
        ],
      },
      {
        name: "Second-Order Markov Process",
        blocks: [
          text(
            "A first-order Markov process depends on the current state. A second-order Markov process depends on the previous two states. For three states A, B, and C, there is a transition distribution for every pair of previous states.",
          ),
          code(String.raw`import numpy as np

states = ["A", "B", "C"]
n = len(states)
P = np.zeros((n, n, n))

print("Enter transition probabilities for each previous state pair:")

for i in range(n):
    for j in range(n):
        print("Previous states:", states[i], states[j])
        P[i][j] = list(map(float, input(
            "Enter probabilities for A B C: "
        ).split()))

steps = int(input("Enter number of steps: "))
first = int(input("Enter first state index (0=A, 1=B, 2=C): "))
second = int(input("Enter second state index (0=A, 1=B, 2=C): "))

sequence = [states[first], states[second]]

for k in range(steps):
    next_state = np.random.choice(
        range(n),
        p=P[first][second]
    )
    sequence.append(states[next_state])
    first = second
    second = next_state

print("Sequence:")`),
          text(
            "For every pair of previous states, the three probabilities you enter must sum to 1. This program uses a three-state transition tensor of shape 3 × 3 × 3.",
          ),
        ],
      },
    ],
    after: [
      {
        type: "table",
        title: "Practical 04 viva questions",
        headers: ["Question", "Answer"],
        rows: [
          ["What is a stochastic process?", "A collection of random variables representing a system over time."],
          ["What is the Markov property?", "The future depends on the present state, not the entire past."],
          ["What is a transition matrix?", "A matrix containing probabilities of moving between states."],
          ["Why does each row sum to 1?", "The next state must be one of the possible states."],
          ["What is Pⁿ?", "The transition matrix after n steps."],
          ["What is steady state?", "The long-run probability distribution of states."],
          ["First-order vs second-order?", "First-order depends on one previous state. Second-order depends on two."],
        ],
      },
    ],
  },
  {
    number: "05",
    title: "Correlation and Regression Analysis",
    summary:
      "Karl Pearson's coefficient of correlation, Spearman's rank correlation, simple linear regression, and multiple linear regression.",
    programs: [
      {
        name: "Karl Pearson's Correlation Coefficient",
        blocks: [
          text("Formula:"),
          formula(
            String.raw`r=\dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\sum(x_i-\bar{x})^2\sum(y_i-\bar{y})^2}}`,
          ),
          code(String.raw`import numpy as np

x = list(map(float, input("Enter X values: ").split()))
y = list(map(float, input("Enter Y values: ").split()))

if len(x) != len(y) or len(x) < 2:
    print("Invalid input")
else:
    x = np.array(x)
    y = np.array(y)

    mean_x = np.mean(x)
    mean_y = np.mean(y)

    numerator = np.sum((x - mean_x) * (y - mean_y))
    denominator = np.sqrt(
        np.sum((x - mean_x) ** 2) *
        np.sum((y - mean_y) ** 2)
    )

    if denominator == 0:
        print("Correlation is undefined")
    else:
        r = numerator / denominator
        print("Karl Pearson Correlation:", round(r, 4))`),
          {
            type: "table",
            title: "Interpretation",
            headers: ["Value of r", "Meaning"],
            rows: [
              ["+1", "Perfect positive correlation"],
              ["0", "No linear correlation"],
              ["−1", "Perfect negative correlation"],
            ],
          },
        ],
      },
      {
        name: "Spearman's Rank Correlation",
        blocks: [
          text("Spearman's correlation measures the relationship between ranked variables."),
          text("Formula when there are no tied ranks:"),
          formula(String.raw`\rho=1-\dfrac{6\sum d^2}{n(n^2-1)}`),
          code(String.raw`from scipy.stats import spearmanr

x = list(map(float, input("Enter X values: ").split()))
y = list(map(float, input("Enter Y values: ").split()))

if len(x) != len(y) or len(x) < 2:
    print("Invalid input")
else:
    rho, p_value = spearmanr(x, y)
    print("Spearman Correlation:", round(rho, 4))
    print("P-value:", round(p_value, 4))`),
          text(
            "Spearman's method uses ranks rather than the original values. spearmanr() also handles tied ranks.",
          ),
        ],
      },
      {
        name: "Simple Linear Regression",
        blocks: [
          text("Simple linear regression predicts Y using one independent variable X."),
          formula(String.raw`Y=a+bX`),
          {
            type: "points",
            items: ["a = intercept", "b = slope"],
          },
          code(String.raw`import numpy as np
from scipy.stats import linregress

x = list(map(float, input("Enter X values: ").split()))
y = list(map(float, input("Enter Y values: ").split()))

if len(x) != len(y) or len(x) < 2:
    print("Invalid input")
else:
    result = linregress(x, y)
    a = result.intercept
    b = result.slope

    print("Intercept:", a)
    print("Slope:", b)
    print("R-squared:", result.rvalue ** 2)

    value = float(input("Enter X value to predict: "))
    prediction = a + b * value
    print("Predicted Y:", prediction)`),
        ],
      },
      {
        name: "Multiple Linear Regression",
        blocks: [
          text("Multiple regression predicts Y using two or more independent variables."),
          formula(String.raw`Y=b_0+b_1X_1+b_2X_2+\cdots+b_nX_n`),
          code(String.raw`import numpy as np
from sklearn.linear_model import LinearRegression

n = int(input("Enter number of observations: "))
m = int(input("Enter number of independent variables: "))

X = []
y = []

print("Enter independent variable values:")
for i in range(n):
    row = list(map(float, input().split()))
    X.append(row)

print("Enter dependent variable values:")
for i in range(n):
    y.append(float(input()))

model = LinearRegression()
model.fit(X, y)

print("Intercept:", model.intercept_)
print("Coefficients:", model.coef_)
print("R-squared:", model.score(X, y))

print("Enter values for prediction:")
new_data = list(map(float, input().split()))
prediction = model.predict([new_data])
print("Predicted Value:", prediction[0])`),
          text("Example: predicting crop production from rainfall, fertilizer use, and temperature."),
        ],
      },
    ],
    after: [
      {
        type: "table",
        title: "Practical 05 viva questions",
        headers: ["Question", "Answer"],
        rows: [
          ["What is correlation?", "It measures the strength and direction of a relationship."],
          ["What is regression?", "It models a relationship so a dependent variable can be predicted."],
          ["What is Pearson correlation?", "A measure of linear correlation."],
          ["What is Spearman correlation?", "A measure of rank-based association."],
          ["What is the range of correlation?", "−1 to +1."],
          ["What is simple regression?", "One independent variable."],
          ["What is multiple regression?", "Two or more independent variables."],
          ["What is R-squared?", "The proportion of variance in the dependent variable explained by the model."],
        ],
      },
      text("A high correlation does not prove that one variable causes the other."),
    ],
  },
  {
    number: "06",
    title: "Numerical Methods",
    summary:
      "Lagrange interpolation, Newton's divided difference interpolation, Gauss elimination, and LU decomposition by Doolittle's method.",
    programs: [
      {
        name: "Lagrange's Interpolation",
        blocks: [
          text("Formula:"),
          formula(String.raw`P(x)=\sum_{i=0}^{n} y_i L_i(x)`),
          code(String.raw`def lagrange(x_values, y_values, x):
    n = len(x_values)
    result = 0

    for i in range(n):
        term = y_values[i]
        for j in range(n):
            if i != j:
                if x_values[i] == x_values[j]:
                    raise ValueError("X values must be distinct")
                term *= (x - x_values[j]) / (x_values[i] - x_values[j])
        result += term

    return result

n = int(input("Enter number of data points: "))
x_values = []
y_values = []

for i in range(n):
    x_values.append(float(input("Enter x value: ")))
    y_values.append(float(input("Enter y value: ")))

x = float(input("Enter interpolation value: "))

try:
    answer = lagrange(x_values, y_values, x)
    print("Interpolated Value:", answer)
except ValueError as e:
    print(e)`),
          {
            type: "sample",
            title: "Sample input",
            text: `Enter number of data points: 3

x: 1
y: 1

x: 2
y: 4

x: 3
y: 9

Enter interpolation value: 2.5`,
          },
          {
            type: "sample",
            title: "Output",
            text: "Interpolated Value: 6.25",
          },
        ],
      },
      {
        name: "Newton's Divided Difference Interpolation",
        blocks: [
          text("Newton's method uses a divided difference table to calculate the interpolation coefficients."),
          code(String.raw`def newton(x_values, y_values, x):
    n = len(x_values)

    if len(set(x_values)) != n:
        raise ValueError("X values must be distinct")

    table = [[0.0 for j in range(n)] for i in range(n)]

    for i in range(n):
        table[i][0] = y_values[i]

    for j in range(1, n):
        for i in range(n - j):
            table[i][j] = (
                table[i + 1][j - 1] - table[i][j - 1]
            ) / (x_values[i + j] - x_values[i])

    result = table[0][0]
    product = 1

    for j in range(1, n):
        product *= (x - x_values[j - 1])
        result += table[0][j] * product

    return table, result

n = int(input("Enter number of data points: "))
x_values = []
y_values = []

for i in range(n):
    x_values.append(float(input("Enter x value: ")))
    y_values.append(float(input("Enter y value: ")))`),
          {
            type: "sample",
            title: "Sample output for (1, 1), (2, 4), (3, 9), with x = 2.5",
            text: `Divided Difference Table:
[1.0, 3.0, 1.0]
[4.0, 5.0, 0.0]
[9.0, 0.0, 0.0]

Interpolated Value: 6.25`,
          },
          {
            type: "table",
            title: "Lagrange and Newton",
            headers: ["Lagrange", "Newton"],
            rows: [
              ["Uses basis polynomials.", "Uses divided differences."],
              ["Calculates the interpolation directly.", "Builds a divided difference table."],
              ["Adding a point generally means recalculating.", "Existing divided differences can be reused."],
            ],
          },
          text("Both methods work with distinct, unequally spaced x-values."),
        ],
      },
      {
        name: "Gauss Elimination",
        blocks: [
          text(
            "Gauss elimination converts a coefficient matrix into an upper triangular matrix, then uses back substitution.",
          ),
          code(String.raw`import numpy as np

n = int(input("Enter number of variables: "))
A = []

print("Enter coefficient matrix:")
for i in range(n):
    A.append(list(map(float, input().split())))

b = []
print("Enter constant values:")
for i in range(n):
    b.append(float(input()))

A = np.array(A)
b = np.array(b)

# Forward elimination
for i in range(n):
    # Partial pivoting
    pivot = i + np.argmax(np.abs(A[i:, i]))
    A[[i, pivot]] = A[[pivot, i]]
    b[[i, pivot]] = b[[pivot, i]]

    if abs(A[i, i]) < 1e-12:
        print("No unique solution")
        break

    for j in range(i + 1, n):
        factor = A[j, i] / A[i, i]`),
          {
            type: "points",
            title: "Important concepts",
            items: [
              "Forward elimination converts the matrix into upper triangular form.",
              "Back substitution calculates the unknown variables.",
              "Pivoting swaps rows to avoid dividing by a zero or very small pivot.",
            ],
          },
        ],
      },
      {
        name: "LU Decomposition — Doolittle's Method",
        blocks: [
          text("LU decomposition splits a matrix into two matrices."),
          formula(String.raw`A=LU`),
          {
            type: "points",
            items: [
              "L is the lower triangular matrix. In Doolittle's method its diagonal entries are 1.",
              "U is the upper triangular matrix.",
            ],
          },
          code(String.raw`import numpy as np

n = int(input("Enter matrix size: "))
A = []

print("Enter matrix:")
for i in range(n):
    A.append(list(map(float, input().split())))

A = np.array(A)
L = np.zeros((n, n))
U = np.zeros((n, n))

for i in range(n):
    # Calculate upper triangular matrix
    for k in range(i, n):
        sum1 = 0
        for j in range(i):
            sum1 += L[i][j] * U[j][k]
        U[i][k] = A[i][k] - sum1

    # Calculate lower triangular matrix
    L[i][i] = 1
    for k in range(i + 1, n):
        sum2 = 0
        for j in range(i):
            sum2 += L[k][j] * U[j][i]`),
        ],
      },
    ],
  },
];

export function blockText(block: Block): string {
  switch (block.type) {
    case "text":
    case "formula":
      return block.type === "formula" ? block.tex : block.text;
    case "code":
      return block.code;
    case "points":
      return [block.title ?? "", ...block.items].join(" ");
    case "table":
      return [block.title ?? "", ...block.headers, ...block.rows.flat()].join(" ");
    case "sample":
      return `${block.title} ${block.text}`;
  }
}

export function programText(program: Program): string {
  return [program.name, ...program.blocks.map(blockText)].join("\n");
}
