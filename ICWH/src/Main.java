import java.util.Random;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        //Random Object
        Random rand = new Random();

        //Generate Random Number
        int random_Number = rand.nextInt(26);

        Scanner input = new Scanner(System.in);

        Indicators out = null;
        int numberOfAttempts = 0;

        do {
            System.out.print("Enter a letter in the English alphabet ");
            char letter = input.next().charAt(0);

            // Validation
            if (Character.isLetter(letter)) {
                letter = Character.toUpperCase(letter);

                ComparingAlgo comparingAlgo1= new ComparingAlgo(letter, random_Number);

                out= comparingAlgo1.compare();
                numberOfAttempts++;

                //IF letter match
                if (out==Indicators.FOUND){
                    System.out.println("You got it!");
                    System.out.println("Number of attempts: " + numberOfAttempts);
                }
                //Show the indicators
                else {
                    System.out.println(out);
                }

            } else {
                System.out.println("Invalid input! Please enter a letter.");
            }
        }
       while (out != Indicators.FOUND);

    }
}