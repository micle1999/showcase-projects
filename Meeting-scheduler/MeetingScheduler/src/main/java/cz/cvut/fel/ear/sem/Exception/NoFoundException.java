package cz.cvut.fel.ear.sem.Exception;

public class NoFoundException extends EarException {

    public NoFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public NoFoundException(String message) {
        super(message);
    }

    public NoFoundException(Throwable cause) {
        super(cause);
    }

    public static NoFoundException create(String resourceName, Object identifier) {
        return new NoFoundException(resourceName + " identified by " + identifier + " not found." );
    }
}