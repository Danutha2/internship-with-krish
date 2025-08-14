public class ComparingAlgo {

    char[] alphabet = {
            'A','B','C','D','E','F','G','H','I',
            'J','K','L','M','N','O','P','Q','R',
            'S','T','U','V','W','X','Y','Z'
    };

    //User Input Letter
    char UIL;
    //System Generated Letter Number
    int SGL_Number;


    ComparingAlgo(char UIL,int SGL_Number) {
        this.UIL = UIL;
        this.SGL_Number = SGL_Number;

    }

    //MAIN function for the algorithm
    public  Indicators compare () {
        //User Input Letter Index
        int UIL_Number=findValueOfLetterInList(UIL);

        if (UIL_Number != SGL_Number){

            int difference = diff(UIL_Number,SGL_Number);

            //Check for HOT
            if(difference<=2){
                return Indicators.HOT;
            }

            //Check For WARM
            else if(difference <= 4){
                return Indicators.WARM;
            }

            //Check for COOL
            else if (difference <= 6) {
                return Indicators.COOL;
            }

            //Check For ICE
            else {
                return Indicators.ICE;
            }
        }

        else {
            return Indicators.FOUND;
        }



    }

    public  int findValueOfLetterInList(char letter) {
        int left = 0;
        int right = alphabet.length - 1;

        while (left <= right) {
            int mid = (left + right) / 2;

            if (alphabet[mid] == letter) {
                return mid;
            }
            else if (alphabet[mid] < letter) {
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        return -1; // not found
    }



    public static int diff(int number1,int number2) {
        return Math.abs(number1-number2);
    }

}
